import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useSetProductParent } from '~/features/products/hooks/useSetProductParent';
import { setProductParentAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductParent', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set parent action', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Morkos (Zewa)', 'Morkos');

        expect(setProductParentAction).toHaveBeenNthCalledWith(1, 'Daržovės', 'Morkos (Zewa)', 'Morkos');
    });

    it('calls set parent action with undefined to clear the parent', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', 'Morkos (Zewa)', undefined);

        expect(setProductParentAction).toHaveBeenNthCalledWith(1, 'Daržovės', 'Morkos (Zewa)', undefined);
    });

    it('does not call set parent action with empty group', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('', 'Morkos (Zewa)', 'Morkos');

        expect(setProductParentAction).not.toHaveBeenCalled();
    });

    it('does not call set parent action with empty name', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockRedux });
        await result.current('Daržovės', '', 'Morkos');

        expect(setProductParentAction).not.toHaveBeenCalled();
    });
});
