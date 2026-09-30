import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { setVariantImageAction } from '~/server/actions/products';
import { useSetVariantImage } from '~/store/products/useSetVariantImage';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetVariantImage', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set variant image action', async () => {
        const { result } = renderHook(() => useSetVariantImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');

        expect(setVariantImageAction).toHaveBeenCalledWith('Uogienės', 'Braškės', '0.5l', 'data:image/png;base64,AAA');
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
