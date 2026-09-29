import { renderHook } from '@testing-library/react';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { useSuspenseApiRequest } from '~/store/common/useSuspenseApiRequest';

vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useSuspenseApiRequest', () => {
    it('loads initial and refreshed data through a Server Action', async () => {
        const request = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);

        const { result } = renderHook(() => useSuspenseApiRequest());
        await result.current('/api/v1/groups', true);
        await result.current('/api/v1/groups');

        expect(request).toHaveBeenCalledTimes(2);
        expect(request).toHaveBeenCalledWith('/api/v1/groups', 'GET');
    });
});
