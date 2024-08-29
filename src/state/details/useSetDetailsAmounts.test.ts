import { renderHook } from '@testing-library/react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsAmounts } from '~/state/details/useSetDetailsAmounts';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');

describe('useSetDetailsAmounts', () => {
    const request = jest.fn();

    beforeAll(() => (useUpdatingApiRequest as jest.Mock).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsAmounts(), withReduxState());
        await result.current('G', 'A', 21, [{ variant: 'p', amount: 1 }]);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetAmounts, {
            group: 'G',
            name: 'A',
            year: 21,
            amounts: [{ variant: 'p', amount: 1 }],
        });
    });

    it('calls update action without value', async () => {
        const { result } = renderHook(() => useSetDetailsAmounts(), withReduxState());
        await result.current('G', 'A', 21);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetAmounts, {
            group: 'G',
            name: 'A',
            year: 21,
        });
    });

    it('calls update action with withoutHistory=true', async () => {
        const { result } = renderHook(() => useSetDetailsAmounts(), withReduxState());
        await result.current('G', 'A', 21, undefined, true);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetAmounts, {
            group: 'G',
            name: 'A',
            year: 21,
            withoutHistory: true,
        });
    });
});
