'use server';

import type { ProductHistory } from '~/common/data';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

function validateHistorySelection(group: string, name: string, year: number): void {
    if (!group || !name || !Number.isInteger(year)) {
        throw new Error('Invalid history selection');
    }
}

export async function getProductHistory(group: string, name: string, year: number): Promise<ProductHistory> {
    validateHistorySelection(group, name, year);
    const [updates, undates] = await Promise.all([
        getProductUpdates(group, name, year),
        getProductUndates(group, name, year),
    ]);
    return { updates, undates };
}

export async function getSummaryHistory(group: string, name: string, year: number): Promise<ProductHistory> {
    validateHistorySelection(group, name, year);
    const [updates, undates] = await Promise.all([
        getSummaryUpdates(group, name, year),
        getSummaryUndates(group, name, year),
    ]);
    return { updates, undates };
}
