import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useSetProductParent } from '~/features/products/hooks/useSetProductParent';
import { setProductParentAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductParent', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set parent action', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: 'Morkos' });

        expect(setProductParentAction).toHaveBeenNthCalledWith(1, {
            group: 'Daržovės',
            name: 'Morkos (Zewa)',
            parent: 'Morkos',
        });
    });

    it('calls set parent action with undefined to clear the parent', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: 'Morkos (Zewa)', parent: undefined });

        expect(setProductParentAction).toHaveBeenNthCalledWith(1, {
            group: 'Daržovės',
            name: 'Morkos (Zewa)',
            parent: undefined,
        });
    });

    it('does not call set parent action with empty group', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockData });
        await result.current({ group: '', name: 'Morkos (Zewa)', parent: 'Morkos' });

        expect(setProductParentAction).not.toHaveBeenCalled();
    });

    it('does not call set parent action with empty name', async () => {
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockData });
        await result.current({ group: 'Daržovės', name: '', parent: 'Morkos' });

        expect(setProductParentAction).not.toHaveBeenCalled();
    });
});
