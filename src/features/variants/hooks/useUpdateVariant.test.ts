import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

import { useUpdateVariant } from '~/features/variants/hooks/useUpdateVariant';
import { updateVariantAction } from '~/server/actions/variants';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/features/variants/hooks/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useUpdateVariant', () => {
    afterEach(() => vi.clearAllMocks());

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
