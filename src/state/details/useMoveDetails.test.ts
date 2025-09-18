import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useMoveDetails } from '~/state/details/useMoveDetails';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useMoveDetails', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls move action', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Daržovės');

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsMove, {
            group: 'Uogienės',
            name: 'Avietės',
            newGroup: 'Daržovės',
        });
    });

    it('does not call move action with same name', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 'Uogienės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 'Daržovės');

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call move action with empty new group', async () => {
        const { result } = renderHook(() => useMoveDetails(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', '');

        expect(request).not.toHaveBeenCalled();
    });
});
