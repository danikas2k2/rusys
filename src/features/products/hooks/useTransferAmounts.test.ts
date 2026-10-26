import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useTransferAmounts } from '~/features/products/hooks/useTransferAmounts';
import { trackFaroEvent } from '~/lib/observability/faro';
import { transferAmountsAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'));

describe('useTransferAmounts', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(transferAmountsAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useTransferAmounts(), { wrapper: MockData });
        const request = {
            group: 'Private group',
            name: 'Private product',
            year: 25,
            targetGroup: 'Private target',
            targetName: 'Private target product',
            amounts: [{ variant: 'Private variant', amount: 3, home: true }],
        };

        await expect(result.current(request)).rejects.toBe(error);

        expect(transferAmountsAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'stock', action: 'transfer_amounts', result: 'started' }],
            ['data_action', { entity: 'stock', action: 'transfer_amounts', result: 'error' }],
        ]);
    });

    it('moves amount rows and refreshes products afterwards', async () => {
        const refresh = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetProducts).mockReturnValue(refresh);

        const { result } = renderHook(() => useTransferAmounts(), { wrapper: MockData });
        const amounts = [{ variant: '0.5 l', amount: 3, home: true }];
        await result.current({
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            targetGroup: 'Vaisiai',
            targetName: 'Obuoliai',
            amounts,
        });

        expect(transferAmountsAction).toHaveBeenCalledWith({
            group: 'Daržovės',
            name: 'Morkos',
            year: 22,
            targetGroup: 'Vaisiai',
            targetName: 'Obuoliai',
            amounts,
            comment: undefined,
        });
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });
});
