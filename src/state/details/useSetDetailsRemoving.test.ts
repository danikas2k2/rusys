import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { ApiUrl } from '~/types/api';

jest.mock('~/state/base/useUpdatingApiRequest');

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
});
