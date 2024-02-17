import { renderHook } from '@testing-library/react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useGetSummary } from '~/state/summary/useGetSummary';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSummaryLoader', () => {
    const request = jest.fn();

    beforeEach(() => {
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('send /summary api request for data', () => {
        const { result } = renderHook(() => useGetSummary());
        expect(result.current()).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/summary');
    });
});
