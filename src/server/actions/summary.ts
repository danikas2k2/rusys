'use server';

import type { ProductHistory } from '~/common';
import { isRequiredString, isYear } from '~/server/actions/validation';
import { requireSession } from '~/server/auth/session';
import { getFullSummary, getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';

export async function readSummary() {
    await requireSession();
    return getFullSummary();
}

export async function getSummaryHistory(group: string, name: string, year: number): Promise<ProductHistory> {
    await requireSession();
    if (!isRequiredString(group) || !isRequiredString(name) || !isYear(year)) {
        throw new Error('Invalid history selection');
    }
    if (process.env.PLAYWRIGHT_TEST === '1') {
        const { getVisualScenario, getVisualSummaryHistory } = await import('~/tests/fixtures/visualData');
        if (await getVisualScenario()) {
            return getVisualSummaryHistory(group, name, year);
        }
    }
    const [updates, undates] = await Promise.all([
        getSummaryUpdates(group, name, year),
        getSummaryUndates(group, name, year),
    ]);
    return { updates, undates };
}
