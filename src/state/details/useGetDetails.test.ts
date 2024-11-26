import { renderHook } from '@testing-library/react';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useGetDetails } from '~/state/details/useGetDetails';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useGetDetails', () => {
    const request = jest.fn();

    beforeEach(() => {
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('request data from /details and update current state', async () => {
        const { result } = renderHook(() => useGetDetails());
        await result.current();
        expect(request).toHaveBeenCalledWith('/details');
    });
});
