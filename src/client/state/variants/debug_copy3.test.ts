import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { ApiUrl } from '~/types/api';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useCopyVariant debug', () => {
    const request = vi.fn().mockResolvedValue(undefined);
    
    beforeAll(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });
    
    afterEach(() => vi.clearAllMocks());
    
    it('test 1', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('G1', 'p', 'G2', undefined);
        expect(request).toHaveBeenCalled();
        console.log('after test1: useUpdating returns type:', typeof vi.mocked(useUpdatingApiRequest)());
    });
    
    it('test 2', async () => {
        console.log('test2: useUpdating.mockReturnValue:', vi.mocked(useUpdatingApiRequest).getMockImplementation());
        const returnedFn = vi.mocked(useUpdatingApiRequest)();
        console.log('test2: returned from useUpdating:', typeof returnedFn, returnedFn === request);
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        await result.current('G1', 'p', 'G2', 'x');
        expect(request).toHaveBeenCalled();
    });
});
