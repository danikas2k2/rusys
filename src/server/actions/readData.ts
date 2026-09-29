'use server';

import { requireSession } from '~/server/auth/session';
import { getGroups } from '~/server/data/groups';
import { getProductsWithYears } from '~/server/data/products';
import { getFullSummary } from '~/server/data/summary';
import { getVariants } from '~/server/data/variants';

export async function readGroups() {
    await requireSession();
    return getGroups();
}

export async function readVariants() {
    await requireSession();
    const [groups, variants] = await Promise.all([getGroups(), getVariants()]);
    return { groups, variants };
}

export async function readProducts() {
    await requireSession();
    const [data, groups, variants] = await Promise.all([getProductsWithYears(), getGroups(), getVariants()]);
    return { ...data, groups, variants };
}

export async function readSummary() {
    await requireSession();
    return getFullSummary();
}
