import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useDeleteVariant } from '~/features/variants/hooks/useDeleteVariant';
import { trackFaroEvent } from '~/lib/observability/faro';
import { deleteVariantAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
vi.mock(import('~/lib/observability/faro'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useDeleteVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures and reports only static failure categories', async () => {
        const error = new Error('Sensitive persistence failure for Private group');
        vi.mocked(deleteVariantAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useDeleteVariant(), { wrapper: MockData });

        await expect(result.current({ group: 'Private group', variant: 'Private variant' })).rejects.toBe(error);

        expect(deleteVariantAction).toHaveBeenCalledExactlyOnceWith({
            group: 'Private group',
            variant: 'Private variant',
        });
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'variant', action: 'delete', result: 'started' }],
            ['data_action', { entity: 'variant', action: 'delete', result: 'error' }],
        ]);
    });

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
