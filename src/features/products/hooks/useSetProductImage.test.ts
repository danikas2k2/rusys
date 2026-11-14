import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useSetProductImage } from '~/features/products/hooks/useSetProductImage';
import { trackFaroEvent } from '~/lib/observability/faro';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
import { setProductImageAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/observability/faro'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

describe('useSetProductImage', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set image action', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Braškės', image: `upload:${'a'.repeat(64)}` });

        expect(setProductImageAction).toHaveBeenCalledWith({
            group: 'Uogienės',
            name: 'Braškės',
            image: `upload:${'a'.repeat(64)}`,
        });
    });

    it('submits an image token through the action and refreshes the products', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });

        await result.current(
            { group: 'Fruit & jam', name: 'Wild berries', image: `upload:${'a'.repeat(64)}` },
            onProgress
        );

        expect(setProductImageAction).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ image: `upload:${'a'.repeat(64)}` })
        );
        expect(vi.mocked(setProductImageAction).mock.calls[0][0].image).toBe(`upload:${'a'.repeat(64)}`);
        expect(uploadWithProgress).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
        expect(trackFaroEvent).toHaveBeenCalledWith('image_uploaded');
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });

        await result.current({ group: 'Fruit', name: 'Berries', image: '/image.png' }, vi.fn());

        expect(setProductImageAction).toHaveBeenCalledExactlyOnceWith({
            group: 'Fruit',
            name: 'Berries',
            image: '/image.png',
        });
        expect(uploadWithProgress).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalledWith('image_uploaded');
    });

    it('does not call set image action with empty group', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });
        await result.current({ group: '', name: 'Braškės', image: `upload:${'a'.repeat(64)}` });

        expect(setProductImageAction).not.toHaveBeenCalled();
    });

    it('does not call set image action with empty name', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', image: `upload:${'a'.repeat(64)}` });

        expect(setProductImageAction).not.toHaveBeenCalled();
    });

    it('refreshes saved data and reports an unavailable image token', async () => {
        vi.mocked(setProductImageAction).mockResolvedValueOnce({ imageUnavailable: true });
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });

        await expect(result.current({ group: 'Fruit', name: 'Berries', image: 'upload:expired' })).rejects.toThrow(
            SchemaError.ImageUnavailable
        );
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('propagates persistence failures without refreshing data', async () => {
        vi.mocked(setProductImageAction).mockRejectedValueOnce(new Error('persistence failed'));
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockData });

        await expect(result.current({ group: 'Fruit', name: 'Berries', image: 'upload:expired' })).rejects.toThrow(
            'persistence failed'
        );
        expect(refresh).not.toHaveBeenCalled();
    });
});
