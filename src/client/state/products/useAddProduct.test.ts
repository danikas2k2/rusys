import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useAddProduct } from '~/client/state/products/useAddProduct';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useAddProduct', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsAdd, {
            group: 'Uogienės',
            name: 'Avietės',
            parent: undefined,
        });
    });

    it('passes parent through when given', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės (Zewa)', 'Avietės');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsAdd, {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(request).not.toHaveBeenCalled();
    });
});
