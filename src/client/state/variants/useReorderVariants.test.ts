import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

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

        expect(request).toHaveBeenCalledWith(ApiUrl.VariantsReorder, { group: 'Uogienės', variants });
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
