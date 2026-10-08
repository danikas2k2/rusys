import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useSetProductImage } from '~/features/products/hooks/useSetProductImage';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { setProductImageAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => refresh }));

describe('useSetProductImage', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set image action', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', 'data:image/png;base64,AAA');

        expect(setProductImageAction).toHaveBeenCalledWith('Uogienės', 'Braškės', 'data:image/png;base64,AAA');
    });

    it('uploads a data image with progress and refreshes the products', async () => {
        const onProgress = vi.fn();
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });

        await result.current('Fruit & jam', 'Wild berries', 'data:image/png;base64,AAA', onProgress);

        expect(uploadWithProgress).toHaveBeenCalledExactlyOnceWith(
            'PUT',
            '/api/v1/groups/Fruit%20%26%20jam/products/Wild%20berries/image',
            JSON.stringify({ image: 'data:image/png;base64,AAA' }),
            onProgress
        );
        expect(setProductImageAction).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('uses the action for an existing image even with a progress callback', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });

        await result.current('Fruit', 'Berries', '/image.png', vi.fn());

        expect(setProductImageAction).toHaveBeenCalledExactlyOnceWith('Fruit', 'Berries', '/image.png');
        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it('does not call set image action with empty group', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('', 'Braškės', 'data:image/png;base64,AAA');

        expect(setProductImageAction).not.toHaveBeenCalled();
    });

    it('does not call set image action with empty name', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'data:image/png;base64,AAA');

        expect(setProductImageAction).not.toHaveBeenCalled();
    });
});
