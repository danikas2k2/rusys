import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useUndoProduct } from '~/client/state/products/useUndoProduct';
import { ApiUrl } from '~/types/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));
vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useUndoProduct', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls undo action', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 25);

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsUndo, { group: 'Uogienės', name: 'Avietės', year: 25 });
    });

    it('does not call undo action with blank name', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 25);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call undo action with blank group', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 25);

        expect(request).not.toHaveBeenCalled();
    });
});
