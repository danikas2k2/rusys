import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { transferAmountsAction } from '~/server/actions/products';
import { useGetProducts } from '~/store/products/useGetProducts';
import { useTransferAmounts } from '~/store/products/useTransferAmounts';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'));

describe('useTransferAmounts', () => {
    it('moves amount rows and refreshes products afterwards', async () => {
        const refresh = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useGetProducts).mockReturnValue(refresh);

        const { result } = renderHook(() => useTransferAmounts(), { wrapper: MockRedux });
        const amounts = [{ variant: '0.5 l', amount: 3, home: true }];
        await result.current('Daržovės', 'Agurkai', 22, 'Vaisiai', 'Obuoliai', amounts, 'user@example.com');

        expect(transferAmountsAction).toHaveBeenCalledWith(
            'Daržovės',
            'Agurkai',
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
