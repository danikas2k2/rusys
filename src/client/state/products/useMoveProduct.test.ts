import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { ApiUrl } from '@rusys/common/api';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useMoveProduct } from '~/client/state/products/useMoveProduct';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useMoveProduct', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Daržovės');

        expect(request).toHaveBeenCalledWith(ApiUrl.ProductsMove, {
            group: 'Uogienės',
            name: 'Avietės',
            newGroup: 'Daržovės',
        });
    });

    it('does not call move action with same name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Uogienės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty new group', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', '');

        expect(request).not.toHaveBeenCalled();
    });
});
