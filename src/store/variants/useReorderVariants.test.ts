import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useReorderVariants } from '~/store/variants/useReorderVariants';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useReorderVariants', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    const variants = { p: 3, d: 2 };

    it('calls reorder action', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockRedux });
        await result.current('Uogienės', variants);

        expect(request).toHaveBeenNthCalledWith(1, '/api/v1/groups/Uogien%C4%97s/variants/order', { variants }, 'PUT');
        expect(request).toHaveBeenNthCalledWith(2, '/api/v1/variants', 'GET');
    });

    it('does not call reorder action with empty group', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockRedux });
        await result.current('', variants);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call reorder action with empty variant set', async () => {
        const { result } = renderHook(() => useReorderVariants(), { wrapper: MockRedux });
        await result.current('Uogienės', {});

        expect(request).not.toHaveBeenCalled();
    });
});
