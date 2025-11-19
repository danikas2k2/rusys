import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { useSetDetailsRemoving } from '~/client/state/details/useSetDetailsRemoving';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useSetDetailsRemoving', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 21, true);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetRemoving, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 21,
            removing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 22, false);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetRemoving, {
            group: 'Uogienės',
            name: 'Avietės',
            year: 22,
            removing: false,
        });
    });

    it('does not call request when group is empty', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), { wrapper: MockRedux });
        await result.current('', 'Avietės', 21, true);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when name is empty', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', '', 21, true);

        expect(request).not.toHaveBeenCalled();
    });

    it('does not call request when year is 0', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), { wrapper: MockRedux });
        await result.current('Uogienės', 'Avietės', 0, true);

        expect(request).not.toHaveBeenCalled();
    });
});
