import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useTransferAmounts } from '~/features/products/hooks/useTransferAmounts';
import { transferAmountsAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'));

describe('useTransferAmounts', () => {
    it('moves amount rows and refreshes products afterwards', async () => {
        const refresh = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetProducts).mockReturnValue(refresh);

        const { result } = renderHook(() => useTransferAmounts(), { wrapper: MockRedux });
        const amounts = [{ variant: '0.5 l', amount: 3, home: true }];
        await result.current('Daržovės', 'Morkos', 22, 'Vaisiai', 'Obuoliai', amounts, 'user@example.com');

        expect(transferAmountsAction).toHaveBeenCalledWith(
            'Daržovės',
            'Morkos',
            22,
            'Vaisiai',
            'Obuoliai',
            amounts,
            'user@example.com',
            undefined
        );
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });
});
