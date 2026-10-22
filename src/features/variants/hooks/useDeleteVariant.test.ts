import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useDeleteVariant } from '~/features/variants/hooks/useDeleteVariant';
import { deleteVariantAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useDeleteVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls delete action', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variant: 'Avietės' });

        expect(deleteVariantAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', variant: 'Avietės' });
        expect(deleteVariantAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call delete action with empty group', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockData });
        await result.current({ group: '', variant: 'Avietės' });

        expect(deleteVariantAction).not.toHaveBeenCalled();
    });

    it('does not call delete action with empty variant', async () => {
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variant: '' });

        expect(deleteVariantAction).not.toHaveBeenCalled();
    });
});
