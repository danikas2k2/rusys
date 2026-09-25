import type { ClientSession, Collection, Document, Filter } from 'mongodb';

import type { Product } from '~/common/data';
import { classifyImage } from '~/server/data/images';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';

const IMAGE_MIGRATION_BATCH_SIZE = 4;

interface ProductWithImageMigrationState extends Product {
    imageChecked?: boolean;
    variantImagesChecked?: Readonly<Record<string, boolean>>;
}

// Backfills `photo` for any `image`/`variantImages` entry left by a pre-classification version of
// the app that turns out to actually be a photo. Icon-sized images are marked as checked, so this
// disk-bound classification only happens once per image.
async function migrateProductImages(
    col: Collection<Product>,
    product: ProductWithImageMigrationState
): Promise<Product> {
    const { imageChecked, variantImagesChecked, ...publicProduct } = product;
    const staleVariants = Object.entries(product.variantImages ?? {}).filter(
        ([variant, url]) => url && !product.variantPhotos?.[variant] && !variantImagesChecked?.[variant]
    );
    if ((!product.image || product.photo || imageChecked) && !staleVariants.length) {
        return publicProduct;
    }

    const $set: Document = {};
    let { image, photo } = product;
    if (image && !photo && !imageChecked) {
        const classified = await classifyImage(image);
        if (classified.photo) {
            image = classified.image;
            photo = classified.photo;
            $set.image = classified.image;
            $set.photo = classified.photo;
        } else {
            $set.imageChecked = true;
        }
    }
    const variantImages = { ...product.variantImages };
    const variantPhotos = { ...product.variantPhotos };
    let checkedVariants: Document = { $ifNull: ['$variantImagesChecked', {}] };
    let updatedVariantImages: Document = { $ifNull: ['$variantImages', {}] };
    let updatedVariantPhotos: Document = { $ifNull: ['$variantPhotos', {}] };
    let hasVariantPhoto = false;
    for (const [variant, url] of staleVariants) {
        const classified = await classifyImage(url);
        if (classified.photo) {
            hasVariantPhoto = true;
            variantImages[variant] = classified.image;
            variantPhotos[variant] = classified.photo;
            updatedVariantImages = {
                $setField: { input: updatedVariantImages, field: { $literal: variant }, value: classified.image },
            };
            updatedVariantPhotos = {
                $setField: { input: updatedVariantPhotos, field: { $literal: variant }, value: classified.photo },
            };
        } else {
            checkedVariants = {
                $setField: { input: checkedVariants, field: { $literal: variant }, value: true },
            };
        }
    }
    if (staleVariants.length) {
        $set.variantImagesChecked = checkedVariants;
        if (hasVariantPhoto) {
            $set.variantImages = updatedVariantImages;
            $set.variantPhotos = updatedVariantPhotos;
        }
    }
    if (Object.keys($set).length) {
        await col.updateOne({ group: product.group, name: product.name }, [{ $set }]);
    }
    return { ...publicProduct, image, photo, variantImages, variantPhotos };
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
        .aggregate<ProductWithImageMigrationState>([
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
                    imageChecked: 1,
                    variantImagesChecked: 1,
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
        .then(async (products) => {
            const migrated: Product[] = [];
            for (let index = 0; index < products.length; index += IMAGE_MIGRATION_BATCH_SIZE) {
                migrated.push(
                    ...(await Promise.all(
                        products
                            .slice(index, index + IMAGE_MIGRATION_BATCH_SIZE)
                            .map((p) => migrateProductImages(col, p))
                    ))
                );
            }
            return migrated;
        });
}

export async function getProductsWithYears(): Promise<{ products: Product[]; years: number[] }> {
    const years = getYears();
    const products = await getProducts();
    const availableYears = new Set(years);
    for (const product of products) {
        for (const { year } of product.years ?? []) {
            if (year) {
                availableYears.add(year);
            }
        }
    }
    return { products, years: Array.from(availableYears).sort((a, b) => b - a) };
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
        $concatArrays: [
            '$$value',
            { $map: { input: { $ifNull: ['$$this.amounts', []] }, as: 'a', in: '$$a.variant' } },
        ],
    };
    const collectCurrentVariants = {
        $reduce: { input: { $ifNull: ['$years', []] }, initialValue: [], in: concatVariants },
    };
    const collectUpdateVariants = {
        $reduce: { input: { $ifNull: ['$$this.years', []] }, initialValue: [], in: concatVariants },
    };
    const concatUpdateVariants = { $concatArrays: ['$$value', collectUpdateVariants] };
    const collectUpdatesVariants = {
        $reduce: { input: { $ifNull: ['$updates', []] }, initialValue: [], in: concatUpdateVariants },
    };
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
