import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useUpdateVariant } from '~/features/variants/hooks/useUpdateVariant';
import { trackFaroEvent } from '~/lib/observability/faro';
import { updateVariantAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
vi.mock(import('~/lib/observability/faro'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useUpdateVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('propagates persistence failures and reports only static failure categories', async () => {
        const error = new Error('Sensitive persistence failure for Private group');
        vi.mocked(updateVariantAction).mockRejectedValueOnce(error);
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockData });

        await expect(result.current({ group: 'Private group', variant: 'Private variant', order: 1 })).rejects.toBe(
            error
        );

        expect(updateVariantAction).toHaveBeenCalledExactlyOnceWith({
            group: 'Private group',
            variant: 'Private variant',
            order: 1,
        });
        expect(refresh).not.toHaveBeenCalled();
        expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
            ['data_action', { entity: 'variant', action: 'update', result: 'started' }],
            ['data_action', { entity: 'variant', action: 'update', result: 'error' }],
        ]);
    });

    it('calls update action with mandatory parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variant: 'p', order: 1 });

        expect(updateVariantAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', variant: 'p', order: 1 });
        expect(updateVariantAction).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('calls update action with additional parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variant: 'p', order: 1, suffix: '1/2' });

        expect(updateVariantAction).toHaveBeenNthCalledWith(1, {
            group: 'Uogienės',
            variant: 'p',
            order: 1,
            suffix: '1/2',
        });
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockData });
        await result.current({ group: '', variant: 'p' });

        expect(updateVariantAction).not.toHaveBeenCalled();
    });

    it('does not call update action with empty variant', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockData });
        await result.current({ group: 'Šaldyti', variant: '' });

        expect(updateVariantAction).not.toHaveBeenCalled();
    });

    it('calls update action with empty update', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockData });
        await result.current({ group: 'Uogienės', variant: 'p' });

        expect(updateVariantAction).toHaveBeenNthCalledWith(1, { group: 'Uogienės', variant: 'p' });
    });
});
