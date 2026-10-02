import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useSetProductImage } from '~/features/products/hooks/useSetProductImage';
import { setProductImageAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useSetProductImage', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls set image action', async () => {
        const { result } = renderHook(() => useSetProductImage(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Braškės', 'data:image/png;base64,AAA');

        expect(setProductImageAction).toHaveBeenCalledWith('Uogienės', 'Braškės', 'data:image/png;base64,AAA');
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
