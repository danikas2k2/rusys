import { renderHook } from '@testing-library/react';
import { useInitialLoader } from '~/hooks/useInitialLoader';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useInitialLoader', () => {
    const request = jest.fn();

    beforeEach(() => {
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('request data from /load and update current state', async () => {
        const { result } = renderHook(() => useInitialLoader());
        await result.current();
        expect(request).toHaveBeenCalledWith('/load');
    });
});
