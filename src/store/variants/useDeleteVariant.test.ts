import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { deleteVariantAction } from '~/server/actions/variants';
import { useDeleteVariant } from '~/store/variants/useDeleteVariant';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/variants/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useDeleteVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės');

        expect(deleteVariantAction).toHaveBeenNthCalledWith(1, 'Uogienės', 'Avietės');
        expect(deleteVariantAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockRedux });
        await result.current('', 'Avietės');

        expect(deleteVariantAction).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty variant', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', '');

        expect(deleteVariantAction).not.toHaveBeenCalled();
    });
});
