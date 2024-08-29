import { renderHook } from '@testing-library/react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSetDetailsMissing', () => {
    const request = jest.fn();

    beforeAll(() => (useUpdatingApiRequest as jest.Mock).mockReturnValue(request));

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
