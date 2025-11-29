import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useGetSummary } from '~/client/state/summary/useGetSummary';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useSummaryLoader', () => {
    const request = vi.fn();

    beforeEach(() => vi.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => vi.clearAllMocks());

    it('send /summary api request for data', () => {
        const { result } = renderHook(() => useGetSummary());

        expect(result.current()).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/summary');
    });
});
