import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { setProductImageAction } from '~/server/actions/products';
import { useSetProductImage } from '~/store/products/useSetProductImage';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/store/products/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

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
