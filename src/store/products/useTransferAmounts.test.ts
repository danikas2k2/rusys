import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useGetProducts } from '~/store/products/useGetProducts';
import { useTransferAmounts } from '~/store/products/useTransferAmounts';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
vi.mock(import('~/store/products/useGetProducts'));

describe('useTransferAmounts', () => {
    it('moves amount rows and refreshes products afterwards', async () => {
        const request = vi.fn().mockResolvedValue(undefined);
        const refresh = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
        vi.mocked(useGetProducts).mockReturnValue(refresh);

        const { result } = renderHook(() => useTransferAmounts(), { wrapper: MockRedux });
        const amounts = [{ variant: '0.5 l', amount: 3, home: true }];
        await result.current('Daržovės', 'Agurkai', 22, 'Vaisiai', 'Obuoliai', amounts, 'user@example.com');

        expect(request).toHaveBeenCalledWith(
            API.productAmountTransfers('Daržovės', 'Agurkai', 22),
            {
                targetGroup: 'Vaisiai',
                targetName: 'Obuoliai',
                amounts,
                user: 'user@example.com',
                comment: undefined,
            },
            'POST'
        );
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });
});
