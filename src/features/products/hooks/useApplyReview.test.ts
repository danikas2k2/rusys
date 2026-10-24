import { renderHook } from '@testing-library/react';
import { MockData } from '@tests/MockData';

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
        const { result } = renderHook(() => useApplyReview(), { wrapper: MockData });
        await result.current({ updates });

        expect(applyReviewAction).toHaveBeenCalledWith({ updates });
    });

    it('does not call apply review action with an empty list', async () => {
        const { result } = renderHook(() => useApplyReview(), { wrapper: MockData });
        await result.current({ updates: [] });

        expect(applyReviewAction).not.toHaveBeenCalled();
    });
});
