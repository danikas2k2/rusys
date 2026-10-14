import type { ProductHistory } from '~/common/data';
import { getProductUndates, getProductUpdates } from '~/server/data/products';
import { getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

export async function getProductHistoryData(group: string, name: string, year: number): Promise<ProductHistory> {
    const [updates, undates] = await Promise.all([
        getProductUpdates(group, name, year),
        getProductUndates(group, name, year),
    ]);
    return { updates, undates };
}

export async function getSummaryHistoryData(group: string, name: string, year: number): Promise<ProductHistory> {
    const [updates, undates] = await Promise.all([
        getSummaryUpdates(group, name, year),
        getSummaryUndates(group, name, year),
    ]);
    return { updates, undates };
}
