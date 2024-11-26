import { renderHook } from '@testing-library/react';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { useAddDetails } from '~/state/details/useAddDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useAddDetails', () => {
    const request = jest.fn();

    beforeAll(() => (useUpdatingApiRequest as jest.Mock).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls add action', async () => {
        const { result } = renderHook(() => useAddDetails(), withReduxState());
        await result.current('G', 'A');
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsAdd, {
            group: 'G',
            name: 'A',
        });
    });

    it('does not call update action with blank name', async () => {
        const { result } = renderHook(() => useAddDetails(), withReduxState());
        await result.current('G', '');
        expect(request).not.toHaveBeenCalled();
    });

    it('does not call update action with blank group', async () => {
        const { result } = renderHook(() => useAddDetails(), withReduxState());
        await result.current('', 'A');
        expect(request).not.toHaveBeenCalled();
    });
});
