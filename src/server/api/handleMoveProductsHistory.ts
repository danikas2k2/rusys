import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { moveProductsHistoryEntry } from '~/server/data/history';
import type { ApiMoveProductsHistoryEntry, ApiRequest, ApiResponse } from '~/types/api';

export async function handleMoveProductsHistory(
    req: ApiRequest<ApiMoveProductsHistoryEntry>,
    res: ApiResponse
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    res.json(
        await run(async () => {
            const { group, name, time, year, newGroup, newName, newYear } =
                req.body ?? ({} as ApiMoveProductsHistoryEntry);
            if (
                !group ||
                !name ||
                !newGroup ||
                !newName ||
                typeof time !== 'number' ||
                !Number.isFinite(time) ||
                typeof year !== 'number' ||
                !Number.isFinite(year) ||
                typeof newYear !== 'number' ||
                !Number.isFinite(newYear)
            ) {
                throw new Error('Invalid request');
            }

            const ok = await moveProductsHistoryEntry(group, name, time, year, newGroup, newName, newYear);
            if (!ok) {
                throw new Error('Move failed');
            }
            return { ok: true };
        })
    );
}
