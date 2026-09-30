import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { saveVariant } from '~/server/actions/variants';
import { useUpdateVariant } from '~/store/variants/useUpdateVariant';

vi.mock(import('~/server/actions/variants'));
const refresh = vi.hoisted(() => vi.fn());
vi.mock(import('~/store/variants/useGetVariants'), () => ({ useGetVariants: () => refresh }));

describe('useUpdateVariant', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls update action with mandatory parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', { order: 1 });

        expect(saveVariant).toHaveBeenNthCalledWith(1, 'Uogienės', 'p', { order: 1 });
        expect(saveVariant).toHaveBeenCalledTimes(1);
        expect(refresh).toHaveBeenCalledExactlyOnceWith();
    });

    it('calls update action with additional parameters', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', { order: 1, suffix: '1/2' });

        expect(saveVariant).toHaveBeenNthCalledWith(1, 'Uogienės', 'p', { order: 1, suffix: '1/2' });
    });

    it('does not call update action with empty group', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('', 'p', {});

        expect(saveVariant).not.toHaveBeenCalled();
    });

    it('does not call update action with empty variant', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Šaldyti', '', {});

        expect(saveVariant).not.toHaveBeenCalled();
    });

    it('calls update action with empty update', async () => {
        const { result } = renderHook(() => useUpdateVariant(), { wrapper: MockRedux });
        await result.current('Uogienės', 'p', {});

        expect(saveVariant).toHaveBeenNthCalledWith(1, 'Uogienės', 'p', {});
    });
});
