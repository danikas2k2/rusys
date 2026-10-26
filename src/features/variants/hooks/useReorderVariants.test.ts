import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useReorderVariants } from '~/features/variants/hooks/useReorderVariants';
import { trackFaroEvent } from '~/lib/observability/faro';
import { reorderVariantsAction } from '~/server/actions/variants';

vi.mock(import('~/lib/observability/faro'));
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
        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('list_reordered', {
            list: 'variants',
            result: 'success',
        });
    });

    it('does not call reorder action with empty group', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockData });
        await result.current({ group: '', variants });

        expect(reorderVariantsAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('does not call reorder action with empty variant set', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variants: {} });

        expect(reorderVariantsAction).not.toHaveBeenCalled();
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });

    it('records a failed reorder without reporting success or refreshing', async () => {
        vi.mocked(reorderVariantsAction).mockRejectedValueOnce(new Error('private error'));
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockData });

        await expect(result.current({ group: 'private', variants: { private: 1 } })).rejects.toThrow('private error');
        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('list_reordered', { list: 'variants', result: 'error' });
        expect(refresh).not.toHaveBeenCalled();
    });
});
