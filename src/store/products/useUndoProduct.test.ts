import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { API } from '~/common/api/v1';
import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useUndoProduct } from '~/store/products/useUndoProduct';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
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

        expect(request).toHaveBeenCalledWith(
            `${API.productAmountHistory('Uogienės', 'Avietės', 25)}/undo`,
            undefined,
            'POST'
        );
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
