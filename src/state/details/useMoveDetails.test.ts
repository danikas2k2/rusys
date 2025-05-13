import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useMoveDetails } from '~/state/details/useMoveDetails';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useMoveDetails', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('G', 'A', 'H');

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsMove, { group: 'G', name: 'A', newGroup: 'H' });
    });

    it('does not call move action with same name', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('G', 'A', 'G');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('G', '', 'H');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('', 'A', 'H');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty new group', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('G', 'A', '');

        expect(request).not.toHaveBeenCalled();
    });
});
