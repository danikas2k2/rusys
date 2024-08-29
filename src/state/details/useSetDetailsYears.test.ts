import { renderHook } from '@testing-library/react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useSetDetailsYears } from '~/state/details/useSetDetailsYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateDetailsYears', () => {
    const request = jest.fn();

    beforeAll(() => (useUpdatingApiRequest as jest.Mock).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsYears(), withReduxState());
        await result.current('G', 'A', [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }]);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetYears, {
            group: 'G',
            name: 'A',
            years: [{ year: 21, amounts: [{ variant: 'p', amount: 1 }] }],
        });
    });

    it('calls update action without year and value', async () => {
        const { result } = renderHook(() => useSetDetailsYears(), withReduxState());
        await result.current('G', 'A');
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetYears, {
            group: 'G',
            name: 'A',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useSetDetailsYears(), withReduxState());
        await result.current('G', '');
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useSetDetailsYears(), withReduxState());
        await result.current('', 'A');
        expect(request).not.toHaveBeenCalled();
    });

    it('calls update action with withoutHistory=true', async () => {
        const { result } = renderHook(() => useSetDetailsYears(), withReduxState());
        await result.current('G', 'A', undefined, true);
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetYears, {
            group: 'G',
            name: 'A',
            withoutHistory: true,
        });
    });
});
