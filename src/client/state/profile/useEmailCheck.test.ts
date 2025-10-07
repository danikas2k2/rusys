import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdateStateFromResponse } from '~/client/state/base/useUpdateStateFromResponse';
import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useEmailCheck } from '~/client/state/profile/useEmailCheck';

jest.mock('~/client/state/common/useApiRequest');
jest.mock('~/client/state/base/useUpdateStateFromResponse');

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
        const { result } = renderHook(() => useEmailCheck(), { wrapper: MockRedux });
        await result.current('big.buddy@email.com');

        expect(request).toHaveBeenCalledWith('/checkUser', {
            email: 'big.buddy@email.com',
        });
        expect(update).toHaveBeenCalledWith(response);
    });

    it('calls user check with empty value', async () => {
        const response = { ok: true, allowed: true };
        request.mockResolvedValueOnce(response);
        const { result } = renderHook(() => useEmailCheck(), { wrapper: MockRedux });
        await result.current('');

        expect(request).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });
});
