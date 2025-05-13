import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useRemoveDetails', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls remove action', async () => {
        const { result } = renderHook(() => useDeleteDetails(), { wrapper: MockRedux });
        await result.current('G', 'A');

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsDelete, { group: 'G', name: 'A' });
    });

    it('does not call remove action with empty name', async () => {
        const { result } = renderHook(() => useDeleteDetails(), { wrapper: MockRedux });
        await result.current('G', '');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call remove action with empty group', async () => {
        const { result } = renderHook(() => useDeleteDetails(), { wrapper: MockRedux });
        await result.current('', 'A');

        expect(request).not.toHaveBeenCalled();
    });
});
