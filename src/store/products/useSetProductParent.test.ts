import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { setProductParentAction } from '~/server/actions/products';
import { useSetProductParent } from '~/store/products/useSetProductParent';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductParent', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set parent action', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai (Zewa)', 'Agurkai');

        expect(setProductParentAction).toHaveBeenNthCalledWith(1, 'Daržovės', 'Agurkai (Zewa)', 'Agurkai');
    });

    it('calls set parent action with undefined to clear the parent', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Agurkai (Zewa)', undefined);

        expect(setProductParentAction).toHaveBeenNthCalledWith(1, 'Daržovės', 'Agurkai (Zewa)', undefined);
    });

    it('does not call set parent action with empty group', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('', 'Agurkai (Zewa)', 'Agurkai');

        expect(setProductParentAction).not.toHaveBeenCalled();
    });

    it('does not call set parent action with empty name', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', '', 'Agurkai');

        expect(setProductParentAction).not.toHaveBeenCalled();
    });
});
