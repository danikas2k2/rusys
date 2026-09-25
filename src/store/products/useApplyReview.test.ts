import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { API } from '@rusys/common/api/v1';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useApplyReview } from '~/store/products/useApplyReview';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useApplyReview', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls apply review action', async () => {
        const updates = [
            { group: 'Uogienės', name: 'Avietės', missing: true },
            { group: 'Uogienės', name: 'Braškės', missing: false },
        ];
        const { result } = renderHook(() => useApplyReview(), { wrapper: MockRedux });
        await result.current(updates);

        expect(request).toHaveBeenCalledWith(API.productReviewStatuses(), { updates }, 'PATCH');
    });

    it('does not call apply review action with an empty list', async () => {
        const { result } = renderHook(() => useApplyReview(), { wrapper: MockRedux });
        await result.current([]);

        expect(request).not.toHaveBeenCalled();
    });
});
