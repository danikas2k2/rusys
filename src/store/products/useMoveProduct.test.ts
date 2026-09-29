import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useMoveProduct } from '~/store/products/useMoveProduct';

vi.mock(import('~/store/base/useUpdatingApiRequest'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useMoveProduct', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveProduct(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Daržovės');

        expect(request).toHaveBeenNthCalledWith(
            1,
            '/api/v1/groups/Uogien%C4%97s/products/Aviet%C4%97s',
            { group: 'Daržovės', newName: undefined },
            'PATCH'
        );
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
