import { debugRequest } from '~/server/api/debug';
import { headerNoCache, run } from '~/server/api/utils';
import { getProductsHistory } from '~/server/data/productsHistory';
import type { ApiGetProductsHistory, ApiRequest, ApiResponse } from '~/types/api';
import type { ProductUpdateHistoryItem } from '~/types/data';

export async function handleProductsHistory(
    req: ApiRequest<ApiGetProductsHistory>,
    res: ApiResponse<{ history: readonly ProductUpdateHistoryItem[] }>
): Promise<void> {
    debugRequest(req);
    headerNoCache(res);
    const year = req.body?.year;
    res.json(
        await run(() => {
            if (typeof year !== 'number' || !Number.isFinite(year) || year < 1970 || year > 9999) {
                throw new Error('Invalid year');
            }
            return getProductsHistory(year);
        })
    );
}
