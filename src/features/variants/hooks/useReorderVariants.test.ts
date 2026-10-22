import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useReorderVariants } from '~/features/variants/hooks/useReorderVariants';
import { reorderVariantsAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useReorderVariants', () => {
    afterEach(() => vi.clearAllMocks());

    const variants = { p: 3, d: 2 };

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variants });

        expect(reorderVariantsAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', variants });
        expect(reorderVariantsAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('does not call reorder action with empty group', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockData });
        await result.current({ group: '', variants });

        expect(reorderVariantsAction).not.toHaveBeenCalled();
    });

    it('does not call reorder action with empty variant set', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variants: {} });

        expect(reorderVariantsAction).not.toHaveBeenCalled();
    });
});
