import { act, renderHook, waitFor } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { readProductSummary } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';
import { useProductSummaryAmounts } from './useProductSummaryAmounts';

vi.mock(import('~/server/actions/summary'));

describe('useProductSummaryAmounts', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads exact product and period and refreshes after stock changes', async () => {
        const amounts = [{ variant: 'jar', amount: 2, recycled: false }];
        vi.mocked(readProductSummary).mockResolvedValue(amounts);
        const { client, wrapper } = mockQuery({ products: [] });
        const { result } = renderHook(() => useProductSummaryAmounts({ group: 'A', name: 'Child', year: 18 }), {
            wrapper,
        });

        await waitFor(() => expect(result.current.data).toStrictEqual(amounts));

        expect(readProductSummary).toHaveBeenCalledWith({ group: 'A', name: 'Child', year: 18 });

        const count = vi.mocked(readProductSummary).mock.calls.length;

        act(() => client.setQueryData(CATALOG_KEYS.products, [{ group: 'A', name: 'Child', years: [] }]));
        await waitFor(() => expect(readProductSummary).toHaveBeenCalledTimes(count + 1));
    });

    it('does not load without a product identity', () => {
        const { wrapper } = mockQuery();
        renderHook(() => useProductSummaryAmounts({ group: '', name: '', year: 26 }), { wrapper });

        expect(readProductSummary).not.toHaveBeenCalled();
    });
});
