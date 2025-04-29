import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSetDetailsMissing', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), withReduxState());
        await result.current('G', 'A', true);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'G',
            name: 'A',
            missing: true,
        });
    });

    it('calls update action with false value', async () => {
        const { result } = renderHook(() => useSetDetailsMissing(), withReduxState());
        await result.current('G', 'A', false);

        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetMissing, {
            group: 'G',
            name: 'A',
            missing: false,
        });
    });
});
