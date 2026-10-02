import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useApplyReview } from '~/features/products/hooks/useApplyReview';
import { applyReviewAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: () => vi.fn() }));

describe('useApplyReview', () => {
    afterEach(() => vi.clearAllMocks());

    it('calls apply review action', async () => {
        const updates = [
            { group: 'Uogienės', name: 'Avietės', missing: true },
            { group: 'Uogienės', name: 'Braškės', missing: false },
        ];
        const { result } = renderHook(() => useApplyReview(), { wrapper: MockRedux });
        await result.current(updates);

        expect(applyReviewAction).toHaveBeenCalledWith(updates);
    });

    it('does not call apply review action with an empty list', async () => {
        const { result } = renderHook(() => useApplyReview(), { wrapper: MockRedux });
        await result.current([]);

        expect(applyReviewAction).not.toHaveBeenCalled();
    });
});
