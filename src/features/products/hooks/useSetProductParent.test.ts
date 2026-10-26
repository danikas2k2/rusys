import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useSetProductParent } from '~/features/products/hooks/useSetProductParent';
import { trackFaroEvent } from '~/lib/observability/faro';
import { setProductParentAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

describe('useSetProductParent', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(setProductParentAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useSetProductParent(), { wrapper: MockData });
        const request = { group: 'Private group', name: 'Private product', parent: 'Private parent' };

        await expect(result.current(request)).rejects.toBe(error);

        expect(setProductParentAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'set_parent', result: 'started' }],
            ['data_action', { entity: 'product', action: 'set_parent', result: 'error' }],
        ]);
    });

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
