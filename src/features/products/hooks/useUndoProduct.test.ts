import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { useUndoProduct } from '~/features/products/hooks/useUndoProduct';
import { trackFaroEvent } from '~/lib/observability/faro';
import { undoProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn(() => vi.fn()) }));

describe('useUndoProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures without refreshing or exposing private content in telemetry', async () => {
        const error = new Error('Sensitive persistence failure for Private product');
        const refresh = vi.fn();
        vi.mocked(useGetProducts).mockReturnValueOnce(refresh);
        vi.mocked(undoProductAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        const request = { group: 'Private group', name: 'Private product', year: 25 };

        await expect(result.current(request)).rejects.toBe(error);

        expect(undoProductAction).toHaveBeenCalledExactlyOnceWith(request);
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'undo', result: 'started' }],
            ['data_action', { entity: 'product', action: 'undo', result: 'error' }],
        ]);
    });

    it('calls undo action', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės', year: 25 });

        expect(undoProductAction).toHaveBeenCalledWith({ group: 'Uogienės', name: 'Avietės', year: 25 });
    });

    it('does not call undo action with blank name', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', year: 25 });

        expect(undoProductAction).not.toHaveBeenCalled();
    });

    it('does not call undo action with blank group', async () => {
        const { result } = renderHook(() => useUndoProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės', year: 25 });

        expect(undoProductAction).not.toHaveBeenCalled();
    });
});
