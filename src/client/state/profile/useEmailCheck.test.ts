import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdateStateFromResponse } from '~/client/state/base/useUpdateStateFromResponse';
import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useEmailCheck } from '~/client/state/profile/useEmailCheck';

vi.mock(import('~/client/state/common/useApiRequest'));
vi.mock(import('~/client/state/base/useUpdateStateFromResponse'));

describe('useEmailCheck', () => {
    const request = vi.fn();
    const update = vi.fn();

    beforeAll(() => {
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useUpdateStateFromResponse).mockReturnValue(update);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls user check', async () => {
        const response = { allowed: true };
        request.mockResolvedValueOnce(response);
        const { result } = renderHook(() => useEmailCheck(), { wrapper: MockRedux });
        await result.current('big.buddy@email.com');

        expect(request).toHaveBeenCalledWith('/api/v1/access?email=big.buddy%40email.com', 'GET');
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
