import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useRedoProduct } from '~/client/state/products/useRedoProduct';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useRedoProduct', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls redo action', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsRedo, { group: 'Uogienės', name: 'Avietės', year: 25 });
    });

    it('does not call redo action with blank name', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call redo action with blank group', async () => {
        const { result } = renderHook(() => useRedoProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(request).not.toHaveBeenCalled();
    });
});
