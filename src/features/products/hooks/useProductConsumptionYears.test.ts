import { act, renderHook, waitFor } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { readProductConsumptionYears } from '~/server/actions/summary';
import { CATALOG_KEYS } from '~/store/catalog';
import { useProductConsumptionYears } from './useProductConsumptionYears';

vi.mock(import('~/server/actions/summary'));

describe('useProductConsumptionYears', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads exact product and period and refreshes after stock changes', async () => {
        const amounts = [25, 24];
        vi.mocked(readProductConsumptionYears).mockResolvedValue(amounts);
        const { client, wrapper } = mockQuery({ products: [] });
        const { result } = renderHook(() => useProductConsumptionYears({ group: 'A', name: 'Child' }), {
            wrapper,
        });

        await waitFor(() => expect(result.current.data).toStrictEqual(amounts));

        expect(readProductConsumptionYears).toHaveBeenCalledWith({ group: 'A', name: 'Child' });

        const count = vi.mocked(readProductConsumptionYears).mock.calls.length;

        act(() => client.setQueryData(CATALOG_KEYS.products, [{ group: 'A', name: 'Child', years: [] }]));
        await waitFor(() => expect(readProductConsumptionYears).toHaveBeenCalledTimes(count + 1));
    });

    it('does not load without a product identity', () => {
        const { wrapper } = mockQuery();
        renderHook(() => useProductConsumptionYears({ group: '', name: '' }), { wrapper });

        expect(readProductConsumptionYears).not.toHaveBeenCalled();
    });
});
