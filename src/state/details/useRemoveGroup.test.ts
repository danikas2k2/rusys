import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useRemoveGroup } from '~/state/details/useRemoveGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRemoveGroup', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call remove action', async () => {
        const { result } = renderHook(() => useRemoveGroup(), withReduxState());
        await result.current('G');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.REMOVE_GROUP, group: 'G' });
        expect(request).toHaveBeenCalledWith('/removeGroup', { group: 'G' });
    });

    it('call remove action with empty group', async () => {
        const { result } = renderHook(() => useRemoveGroup(), withReduxState());
        await result.current('');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.REMOVE_GROUP, group: '' });
        expect(request).toHaveBeenCalledWith('/removeGroup', { group: '' });
    });
});
