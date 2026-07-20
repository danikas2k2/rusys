import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { ApiUrl } from '~/types/api';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useCopyVariant no clear', () => {
    const request = vi.fn().mockResolvedValue(undefined);
    
    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });
    
    // NO afterEach clearAllMocks
    
    it('test 1', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('G1', 'p', 'G2', undefined);
        expect(request).toHaveBeenCalled();
    });
    
    it('test 2', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('G1', 'p', 'G2', 'x');
        expect(request).toHaveBeenCalled();
    });
});
