'use server';

import type { ProductHistory } from '~/common';
import { isRequiredString, isYear } from '~/server/actions/validation';
import { requireSession } from '~/server/auth/session';
import { getSummaryHistoryData } from '~/server/data/actionHistory';
import { getFullSummary } from '~/server/data/summary';

export async function readSummary() {
    await requireSession();
    return getFullSummary();
}

export async function getSummaryHistory(group: string, name: string, year: number): Promise<ProductHistory> {
    await requireSession();
    if (!isRequiredString(group) || !isRequiredString(name) || !isYear(year)) {
        throw new Error('Invalid history selection');
    }
    return getSummaryHistoryData(group, name, year);
}
