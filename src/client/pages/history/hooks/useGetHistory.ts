import { useCallback, useEffect, useState } from 'react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { getErrorMessage } from '~/client/utils/errors';
import { ApiUrl, type ApiResult } from '~/types/api';
import type { ProductUpdateHistoryItem } from '~/types/data';

type HistoryResponse = ApiResult<{ history: readonly ProductUpdateHistoryItem[] }>;

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

export function useGetHistory(year: number): {
    history: readonly ProductUpdateHistoryItem[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
} {
    const request = useApiRequest();
    const [history, setHistory] = useState<readonly ProductUpdateHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await request<HistoryResponse>(ApiUrl.ProductsHistory, { year });
            assertOk(result);
            setHistory(result.history);
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [request, year]);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { history, loading, error, reload };
}


