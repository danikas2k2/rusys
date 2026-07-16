import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getGroups } from '~/server/data/groups';
import { getHistorySessions, getUndateSessions } from '~/server/data/history';
import type { ApiHistory, ApiRequest, ApiRequestHistoryGet, ApiRequestYear, ApiResponse } from '~/types/api';

function parseYear(raw: number): number {
    if (raw >= 2000) {
        return raw;
    }
    // short year e.g. 26 → 2026
    return 2000 + raw;
}

export async function handleProductHistory(
    req: ApiRequest<ApiRequestYear | ApiRequestHistoryGet>,
    res: ApiResponse<ApiHistory>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);

    const raw = req.body?.year;
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
        throw new Error('Invalid year');
    }

    const year = parseYear(raw);
    if (year < 2000 || year > new Date().getFullYear()) {
        throw new Error('Invalid year');
    }

    const body = req.body as ApiRequestHistoryGet | ApiRequestYear;
    const group = 'group' in body ? body.group : undefined;
    const name = 'name' in body ? body.name : undefined;

    res.json(
        await run(async () => ({
            updates: await getHistorySessions(year, group, name),
            undates: await getUndateSessions(year, group, name),
            groups: await getGroups(),
        }))
    );
}
