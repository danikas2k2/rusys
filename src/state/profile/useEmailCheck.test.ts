import { renderHook } from '@testing-library/react';
import { useApiRequest } from '~/hooks/useApiRequest';
import { useUpdateStateFromResponse } from '~/state/base/useUpdateStateFromResponse';
import { useEmailCheck } from '~/state/profile/useEmailCheck';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/hooks/useApiRequest');
jest.mock('~/state/base/useUpdateStateFromResponse');

describe('useEmailCheck', () => {
    const request = jest.fn();
    const update = jest.fn();

    beforeAll(() => {
        (useApiRequest as jest.Mock).mockReturnValue(request);
        (useUpdateStateFromResponse as jest.Mock).mockReturnValue(update);
    });

    afterEach(() => jest.clearAllMocks());

    it('call user check', async () => {
        const response = { ok: true, allowed: true };
        request.mockResolvedValueOnce(response);
        const { result } = renderHook(() => useEmailCheck(), withReduxState());
        await result.current('big.buddy@email.com');
        expect(request).toHaveBeenCalledWith('/checkUser', {
            email: 'big.buddy@email.com',
        });
        expect(update).toHaveBeenCalledWith(response);
    });

    it('call user check with empty value', async () => {
        const response = { ok: true, allowed: true };
        request.mockResolvedValueOnce(response);
        const { result } = renderHook(() => useEmailCheck(), withReduxState());
        await result.current('');
        expect(request).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });
});
