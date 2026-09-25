import type { ClientSession, UpdateFilter } from 'mongodb';

import type { Product } from '~/common/data';
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { db, withTransaction } from '~/server/db';

export async function addProduct(group: string, name: string, parent?: string): Promise<boolean> {
    if (!group || !name || parent === name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    if (parent && !(await col.findOne({ group, name: parent, archivedAt: { $exists: false } }))) {
        return false;
    }
    // Names are still the current identity key.  Re-adding an archived name therefore means
    // restoring its original record rather than silently creating a second, ambiguous history.
    const archived = await col.findOne({ group, name, archivedAt: { $exists: true } });
    if (archived) {
        return col
            .updateOne({ group, name }, { $unset: { archivedAt: 1 }, ...(parent ? { $set: { parent } } : {}) })
            .then(hasEffect);
    }
    return col.insertOne({ group, name, ...(parent ? { parent } : {}) }).then(hasEffect);
}

export async function renameProduct(
    group: string,
    name: string,
    newName: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newName || name === newName) {
        return false;
    }
    const col = (await db()).collection('products');
    const renamed = await col
        .updateOne({ group, name }, { $set: { name: newName } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
    if (renamed) {
        // Keep children pointing at the renamed product.
        await col.updateMany({ group, parent: name }, { $set: { parent: newName } }, { session });
    }
    return renamed;
}

function getDescendantNames(name: string, childrenByParent: ReadonlyMap<string, readonly string[]>): Set<string> {
    const descendants = new Set<string>();
    const stack = [name];
    while (stack.length) {
        for (const child of childrenByParent.get(stack.pop()!) ?? []) {
            if (!descendants.has(child)) {
                descendants.add(child);
                stack.push(child);
            }
        }
    }
    return descendants;
}

export async function setProductParent(group: string, name: string, parent?: string): Promise<boolean> {
    if (!group || !name || parent === name) {
        return false;
    }

    return withTransaction(async (session) => {
        const col = (await db()).collection<Product>('products');
        if (!parent) {
            return col.updateOne({ group, name }, { $unset: { parent: 1 } }, { session }).then(hasEffect);
        }

        const siblings = await col.find({ group }, { projection: { _id: 0, name: 1, parent: 1 }, session }).toArray();
        if (!siblings.some((p) => p.name === parent)) {
            return false;
        }

        const childrenByParent = new Map<string, string[]>();
        for (const p of siblings) {
            if (p.parent) {
                childrenByParent.set(p.parent, [...(childrenByParent.get(p.parent) ?? []), p.name]);
            }
        }
        // Setting parent to one of name's own descendants would create a cycle.
        if (getDescendantNames(name, childrenByParent).has(parent)) {
            return false;
        }

        return col.updateOne({ group, name }, { $set: { parent } }, { session }).then(hasEffect);
    });
}

export async function setProductExpiryTolerance(
    group: string,
    name: string,
    expiryToleranceDays: number
): Promise<boolean> {
    if (!group || !name || !Number.isInteger(expiryToleranceDays) || expiryToleranceDays < 0) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    return expiryToleranceDays
        ? col.updateOne({ group, name }, { $set: { expiryToleranceDays } }).then(hasEffect)
        : col.updateOne({ group, name }, { $unset: { expiryToleranceDays: 1 } }).then(hasEffect);
}

export async function renameProductsVariant(
    group: string,
    variant: string,
    newVariant: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !variant || !newVariant || variant === newVariant) {
        return false;
    }
    const updateYearAmounts = {
        $cond: [
            { $isArray: '$$year.amounts' },
            {
                $mergeObjects: [
                    '$$year',
                    {
                        amounts: {
                            $map: {
                                input: '$$year.amounts',
                                as: 'a',
                                in: {
                                    $cond: [
                                        { $eq: ['$$a.variant', variant] },
                                        { $mergeObjects: ['$$a', { variant: newVariant }] },
                                        '$$a',
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
            '$$year',
        ],
    };

    return (await db())
        .collection('products')
        .bulkWrite(
            [
                {
                    updateMany: {
                        filter: { group, 'years.amounts.variant': variant } as UpdateFilter<Product>,
                        update: [
                            {
                                $set: {
                                    years: {
                                        $map: {
                                            input: '$years',
                                            as: 'year',
                                            in: updateYearAmounts,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    updateMany: {
                        filter: { group, 'updates.years.amounts.variant': variant } as UpdateFilter<Product>,
                        update: [
                            {
                                $set: {
                                    updates: {
                                        $map: {
                                            input: '$updates',
                                            as: 'upd',
                                            in: {
                                                $mergeObjects: [
                                                    '$$upd',
                                                    {
                                                        years: {
                                                            $map: {
                                                                input: '$$upd.years',
                                                                as: 'year',
                                                                in: updateYearAmounts,
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
            { session }
        )
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function renameProductsGroup(group: string, newGroup: string, session?: ClientSession): Promise<boolean> {
    if (!group || !newGroup || group === newGroup) {
        return false;
    }
    return (await db())
        .collection('products')
        .updateMany({ group }, { $set: { group: newGroup } }, { session })
        .then(hasEffect)
        .catch(hasDuplicates);
}

export async function moveProduct(
    group: string,
    name: string,
    newGroup: string,
    newName?: string,
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !newGroup || group === newGroup) {
        return false;
    }
    const $set: { group: string; name?: string } = { group: newGroup };
    if (newName && name !== newName) {
        $set.name = newName;
    }
    return (
        (await db())
            .collection('products')
            // parent is scoped to the old group, so it's no longer valid once the group changes.
            .updateOne({ group, name }, { $set, $unset: { parent: 1 } }, { session })
            .then(hasEffect)
            .catch(hasDuplicates)
    );
}

export async function deleteProduct(group: string, name: string): Promise<boolean> {
    if (!group || !name) {
        return false;
    }
    const col = (await db()).collection<Product>('products');
    if (await col.countDocuments({ group, parent: name, archivedAt: { $exists: false } })) {
        return false;
    }
    return col
        .updateOne({ group, name, archivedAt: { $exists: false } }, { $set: { archivedAt: Date.now() } })
        .then(hasEffect);
}

export async function deleteProductsVariant(
    _group: string,
    _variant: string,
    _session?: ClientSession
): Promise<boolean> {
    // Kept only as a compatibility boundary for old callers. Variant history is embedded in
    // products, so there is intentionally nothing to erase here.
    return false;
}

export async function deleteProductsGroup(_group: string, _session?: ClientSession): Promise<boolean> {
    // Category archiving is inherited by products; do not mark each child or erase its history.
    return false;
}
