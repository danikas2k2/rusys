import { renderHook } from '@testing-library/react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSummaryLoader } from '~/state/summary/useSummaryLoader';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSummaryLoader', () => {
    const request = jest.fn();

    beforeEach(() => {
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('send /summary api request for data', () => {
        const { result } = renderHook(() => useSummaryLoader());
        expect(result.current()).toBeUndefined();
        expect(request).toHaveBeenCalledWith('/summary');
    });
});
