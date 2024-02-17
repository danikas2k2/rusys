import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetDetailsRemoving', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls update action', async () => {
        const { result } = renderHook(() => useSetDetailsRemoving(), withReduxState());
        await result.current('G', 'A', 21, true);
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_REMOVING,
            group: 'G',
            name: 'A',
            year: 21,
            removing: true,
        });
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
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.SET_REMOVING,
            group: 'G',
            name: 'A',
            year: 22,
            removing: false,
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsSetRemoving, {
            group: 'G',
            name: 'A',
            year: 22,
            removing: false,
        });
    });
});
