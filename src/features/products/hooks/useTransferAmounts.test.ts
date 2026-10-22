import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useTransferAmounts } from '~/features/products/hooks/useTransferAmounts';
import { transferAmountsAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'));

describe('useTransferAmounts', () => {
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
