import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { useApiRequest } from '~/common/hooks/useApiRequest';
import { useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';
import { useEmailCheck } from '~/state/profile/useEmailCheck';

jest.mock('~/common/hooks/useApiRequest');
jest.mock('~/state/base/useUpdateStateFromResponse');

describe('useEmailCheck', () => {
    const request = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        jest.mocked(useApiRequest).mockReturnValue(request);
        jest.mocked(useUpdateStateFromResponse).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls user check', async () => {
        const response = { ok: true, allowed: true };
        request.mockResolvedValueOnce(response);
        const { result } = renderHook(() => useEmailCheck(), withReduxState());
        await result.current('big.buddy@email.com');

        expect(request).toHaveBeenCalledWith('/checkUser', {
            email: 'big.buddy@email.com',
        });
        expect(update).toHaveBeenCalledWith(response);
    });

    it('calls user check with empty value', async () => {
        const response = { ok: true, allowed: true };
        request.mockResolvedValueOnce(response);
        const { result } = renderHook(() => useEmailCheck(), withReduxState());
        await result.current('');

        expect(request).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });
});
