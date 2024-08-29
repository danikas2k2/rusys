import { renderHook } from '@testing-library/react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSetDetailsRemoving', () => {
    const request = jest.fn();

    beforeAll(() => (useUpdatingApiRequest as jest.Mock).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), withReduxState());
        await result.current('G', 'A', 21, true);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetRemoving, {
            group: 'G',
            name: 'A',
            year: 21,
            removing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), withReduxState());
        await result.current('G', 'A', 22, false);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetRemoving, {
            group: 'G',
            name: 'A',
            year: 22,
            removing: false,
        });
    });
});
