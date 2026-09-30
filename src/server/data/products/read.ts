import type { ClientSession, Filter } from 'mongodb';

import type { Product } from '~/common/data';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';

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
        .toArray();
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
