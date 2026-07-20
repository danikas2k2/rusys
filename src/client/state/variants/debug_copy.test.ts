import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useCopyVariant } from '~/client/state/variants/useCopyVariant';
import { ApiUrl } from '~/types/api';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useCopyVariant', () => {
    const request = vi.fn();
    
    beforeAll(() => {
        console.log('beforeAll: setting mockReturnValue');
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });
    
    afterEach(() => {
        console.log('afterEach: clearAllMocks, request type:', typeof request, 'useUpdating returns:', typeof vi.mocked(useUpdatingApiRequest)());
        vi.clearAllMocks();
        console.log('after clear: useUpdating returns:', typeof vi.mocked(useUpdatingApiRequest)());
    });
    
    it('test 1', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        console.log('test 1: request is:', typeof request, vi.isMockFunction(request));
        await result.current('G1', 'p', 'G2', undefined);
        expect(request).toHaveBeenCalled();
    });
    
    it('test 2', async () => {
        const { result } = renderHook(() => useCopyVariant(), { wrapper: MockRedux });
        console.log('test 2: request is:', typeof request, vi.isMockFunction(request));
        await result.current('G1', 'p', 'G2', 'x');
        expect(request).toHaveBeenCalled();
    });
});
