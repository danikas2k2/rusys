import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useSetVariantImage } from '~/features/products/hooks/useSetVariantImage';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { setVariantImageAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

describe('useSetVariantImage', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set variant image action', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');

        expect(setVariantImageAction).toHaveBeenCalledWith('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');
    });

    it('uploads a data image with progress and refreshes the products', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });

        await result.current('Fruit & jam', 'Wild berries', '0.5 l', 'data:image/png;base64,AAA', onProgress);

        expect(uploadWithProgress).toHaveBeenCalledExactlyOnceWith(
            'PUT',
            '/api/v1/groups/Fruit%20%26%20jam/products/Wild%20berries/variants/0.5%20l/image',
            JSON.stringify({ image: 'data:image/png;base64,AAA' }),
            onProgress
        );
        expect(setVariantImageAction).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });

        await result.current('Fruit', 'Berries', '0.5 l', '/image.png', vi.fn());

        expect(setVariantImageAction).toHaveBeenCalledExactlyOnceWith('Fruit', 'Berries', '0.5 l', '/image.png');
        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty group', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('', 'Braškės', '0.5l', 'data:image/png;base64,AAA');

        expect(setVariantImageAction).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty name', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', '', '0.5l', 'data:image/png;base64,AAA');

        expect(setVariantImageAction).not.toHaveBeenCalled();
    });

    it('does not call set variant image action with empty variant', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', '', 'data:image/png;base64,AAA');

        expect(setVariantImageAction).not.toHaveBeenCalled();
    });
});
