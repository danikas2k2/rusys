import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useRenameProduct } from '~/features/products/hooks/useRenameProduct';
import { trackFaroEvent } from '~/lib/observability/faro';
import { renameProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

describe('useRenameProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(renameProductAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        const request = { group: 'Private group', name: 'Private product', targetName: 'Private target' };

        await expect(result.current(request)).rejects.toBe(error);

        expect(renameProductAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'rename', result: 'started' }],
            ['data_action', { entity: 'product', action: 'rename', result: 'error' }],
        ]);
    });

    it('calls rename actions', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetName: 'Gervuogės' });

        expect(renameProductAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės',
            targetName: 'Gervuogės',
        });
    });

    it('does not call rename actions with same name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetName: 'Avietės' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', targetName: 'Avietės' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', targetName: '' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });

    it('does not call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', targetName: 'Gervuogės' });

        expect(renameProductAction).not.toHaveBeenCalled();
    });
});
