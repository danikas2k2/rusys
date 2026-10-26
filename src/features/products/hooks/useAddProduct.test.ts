import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useAddProduct } from '~/features/products/hooks/useAddProduct';
import { trackFaroEvent } from '~/lib/observability/faro';
import { addProductAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useAddProduct', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės' });

        expect(addProductAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', name: 'Avietės', parent: undefined });
        expect(trackFaroEvent).toHaveBeenNthCalledWith(1, 'data_action', {
            entity: 'product',
            action: 'create',
            result: 'started',
        });
        expect(trackFaroEvent).toHaveBeenNthCalledWith(2, 'data_action', {
            entity: 'product',
            action: 'create',
            result: 'success',
        });
        expect(trackFaroEvent).toHaveBeenNthCalledWith(3, 'item_created');
    });

    it('passes parent through when given', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Avietės (Zewa)', parent: 'Avietės' });

        expect(addProductAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            name: 'Avietės (Zewa)',
            parent: 'Avietės',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '' });

        expect(addProductAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });
        await result.current({ group: '', name: 'Avietės' });

        expect(addProductAction).not.toHaveBeenCalled();
    });

    it('does not report creation when the mutation fails', async () => {
        vi.mocked(addProductAction).mockRejectedValueOnce(new Error('failed'));
        const { result } = renderHook(() => useAddProduct(), { wrapper: MockData });

        await expect(result.current({ group: 'private category', name: 'private product' })).rejects.toThrow('failed');
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'product', action: 'create', result: 'started' }],
            ['data_action', { entity: 'product', action: 'create', result: 'error' }],
        ]);
    });
});
