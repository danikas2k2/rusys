import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useSetVariantImage } from '~/features/products/hooks/useSetVariantImage';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
import { setVariantImageAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

describe('useSetVariantImage', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set variant image action', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });
        await result.current({
            group: 'Uogienės',
            name: 'Braškės',
            variant: '0.5l',
            image: `upload:${'a'.repeat(64)}`,
        });

        expect(setVariantImageAction).toHaveBeenCalledWith({
            group: 'Uogienės',
            name: 'Braškės',
            variant: '0.5l',
            image: `upload:${'a'.repeat(64)}`,
        });
    });

    it('submits an image token through the action and refreshes the products', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });

        await result.current(
            { group: 'Fruit & jam', name: 'Wild berries', variant: '0.5 l', image: `upload:${'a'.repeat(64)}` },
            onProgress
        );

        expect(setVariantImageAction).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ image: `upload:${'a'.repeat(64)}` })
        );
        expect(vi.mocked(setVariantImageAction).mock.calls[0][0].image).toBe(`upload:${'a'.repeat(64)}`);
        expect(uploadWithProgress).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });

        await result.current({ group: 'Fruit', name: 'Berries', variant: '0.5 l', image: '/image.png' }, vi.fn());

        expect(setVariantImageAction).toHaveBeenCalledExactlyOnceWith({
            group: 'Fruit',
            name: 'Berries',
            variant: '0.5 l',
            image: '/image.png',
        });
        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty group', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });
        await result.current({ group: '', name: 'Braškės', variant: '0.5l', image: `upload:${'a'.repeat(64)}` });

        expect(setVariantImageAction).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty name', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: '', variant: '0.5l', image: `upload:${'a'.repeat(64)}` });

        expect(setVariantImageAction).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty variant', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', name: 'Braškės', variant: '', image: `upload:${'a'.repeat(64)}` });

        expect(setVariantImageAction).not.toHaveBeenCalled();
    });

    it('refreshes saved data and reports an unavailable image token', async () => {
        vi.mocked(setVariantImageAction).mockResolvedValueOnce({ imageUnavailable: true });
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });

        await expect(
            result.current({ group: 'Fruit', name: 'Berries', variant: 'Jar', image: 'upload:expired' })
        ).rejects.toThrow(SchemaError.ImageUnavailable);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('propagates persistence failures without refreshing data', async () => {
        vi.mocked(setVariantImageAction).mockRejectedValueOnce(new Error('persistence failed'));
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockData });

        await expect(
            result.current({ group: 'Fruit', name: 'Berries', variant: 'Jar', image: 'upload:expired' })
        ).rejects.toThrow('persistence failed');
        expect(refresh).not.toHaveBeenCalled();
    });
});
