import type { Product } from '@rusys/common/data';
import type { ClientSession, Collection, Filter } from 'mongodb';

import { classifyImage } from '~/server/data/images';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';

// Backfills `photo` for any `image`/`variantImages` entry left by a pre-classification version of
// the app that turns out to actually be a photo, persisting the result so future reads skip this
// recomputation. An `image` with no `photo` that's genuinely icon-sized is left alone (nothing to
// persist), and gets re-checked - cheaply - on every read, since there's no separate marker for
// "confirmed icon" vs "never checked".
async function migrateProductImages(col: Collection<Product>, product: Product): Promise<Product> {
    const staleVariants = Object.entries(product.variantImages ?? {}).filter(
        ([variant, url]) => url && !product.variantPhotos?.[variant]
    );
    if (!product.image && !staleVariants.length) {
        return product;
    }

    const $set: Record<string, string> = {};
    let { image, photo } = product;
    if (image && !photo) {
        const classified = await classifyImage(image);
        if (classified.photo) {
            image = classified.image;
            photo = classified.photo;
            $set.image = classified.image;
            $set.photo = classified.photo;
        }
    }
    const variantImages = { ...product.variantImages };
    const variantPhotos = { ...product.variantPhotos };
    for (const [variant, url] of staleVariants) {
        const classified = await classifyImage(url);
        if (classified.photo) {
            variantImages[variant] = classified.image;
            variantPhotos[variant] = classified.photo;
            $set[`variantImages.${variant}`] = classified.image;
            $set[`variantPhotos.${variant}`] = classified.photo;
        }
    }
    if (Object.keys($set).length) {
        await col.updateOne({ group: product.group, name: product.name }, { $set });
    }
    return { ...product, image, photo, variantImages, variantPhotos };
}

export async function getProducts(years: readonly number[] = []): Promise<Product[]> {
    const database = await db();
    const col = database.collection<Product>('products');
    // A category archive is inherited by its products.  We deliberately keep the product
    // document itself intact: historical summary queries read it independently of this list.
    const archivedGroups = await database
        .collection('groups')
        .find({ archivedAt: { $exists: true } }, { projection: { _id: 0, group: 1 } })
        .toArray();
    const match: Filter<Product> = {
        archivedAt: { $exists: false },
        group: { $nin: archivedGroups.map(({ group }) => group) },
        ...(years.length
            ? {
                  $or: [
                      { years: { $exists: false } },
                      { years: { $size: 0 } },
                      { 'years.year': { $in: years } } as Filter<Product>,
                  ],
              }
            : {}),
    };
    return col
        .aggregate<Product>([
            { $match: match },
            {
                $project: {
                    _id: 0,
                    group: 1,
                    name: 1,
                    parent: 1,
                    expiryToleranceDays: 1,
                    years: 1,
                    missing: 1,
                    image: 1,
                    photo: 1,
                    variantImages: 1,
                    variantPhotos: 1,
                    updates: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$updates', []] } }, 0] },
                            {
                                $reduce: {
                                    input: '$updates',
                                    initialValue: [],
                                    in: {
                                        $concatArrays: [
                                            '$$value',
                                            { $map: { input: '$$this.years', as: 'y', in: { year: '$$y.year' } } },
                                        ],
                                    },
                                },
                            },
                            '$$REMOVE',
                        ],
                    },
                    undates: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$undates', []] } }, 0] },
                            {
                                $reduce: {
                                    input: '$undates',
                                    initialValue: [],
                                    in: {
                                        $concatArrays: [
                                            '$$value',
                                            { $map: { input: '$$this.years', as: 'y', in: { year: '$$y.year' } } },
                                        ],
                                    },
                                },
                            },
                            '$$REMOVE',
                        ],
                    },
                },
            },
            { $sort: { group: 1, name: 1, 'years.year': 1 } },
        ])
        .toArray()
        .then((products) => Promise.all(products.map((p) => migrateProductImages(col, p))));
}

export async function getProductsWithYears(): Promise<{ products: Product[]; years: number[] }> {
    const years = getYears();
    const products = await getProducts();
    return {
        products,
        years: products
            .reduce(
                (availableYears: number[], product) => {
                    for (const { year } of product.years ?? []) {
                        if (year && !availableYears.includes(year)) {
                            availableYears.push(year);
                        }
                    }
                    return availableYears;
                },
                years.slice(0, 5)
            )
            .sort((a, b) => b - a),
    };
}

export async function getProductVariants(
    group: string,
    name: string,
    session?: ClientSession
): Promise<readonly string[] | undefined> {
    if (!group || !name) {
        return undefined;
    }
    const col = (await db()).collection('products');
    const concatVariants = {
        $concatArrays: ['$$value', { $map: { input: '$$this.amounts', as: 'a', in: '$$a.variant' } }],
    };
    const collectCurrentVariants = { $reduce: { input: '$years', initialValue: [], in: concatVariants } };
    const collectUpdateVariants = { $reduce: { input: '$$this.years', initialValue: [], in: concatVariants } };
    const concatUpdateVariants = { $concatArrays: ['$$value', collectUpdateVariants] };
    const collectUpdatesVariants = { $reduce: { input: '$updates', initialValue: [], in: concatUpdateVariants } };
    return (
        await col
            .aggregate<{
                variants?: string[];
            }>(
                [
                    { $match: { group, name } },
                    { $project: { allVariants: { $setUnion: [collectCurrentVariants, collectUpdatesVariants] } } },
                    { $unwind: '$allVariants' },
                    { $group: { _id: null, variants: { $addToSet: '$allVariants' } } },
                    { $project: { _id: 0, variants: 1 } },
                ],
                { session }
            )
            .next()
    )?.variants;
}
