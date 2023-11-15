import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useRemoveDetails } from '~/state/details/useRemoveDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRemoveDetails', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call remove action', async () => {
        const { result } = renderHook(() => useRemoveDetails(), withReduxState());
        await result.current('G', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.REMOVE, group: 'G', name: 'A' });
        expect(request).toHaveBeenCalledWith('/remove', { group: 'G', name: 'A' });
    });

    it('call remove action with empty name', async () => {
        const { result } = renderHook(() => useRemoveDetails(), withReduxState());
        await result.current('G', '');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.REMOVE, group: 'G', name: '' });
        expect(request).not.toHaveBeenCalled();
    });

    it('call remove action with empty group', async () => {
        const { result } = renderHook(() => useRemoveDetails(), withReduxState());
        await result.current('', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.REMOVE, group: '', name: 'A' });
        expect(request).toHaveBeenCalledWith('/remove', { group: '', name: 'A' });
    });

    it('call remove action with empty group and name', async () => {
        const { result } = renderHook(() => useRemoveDetails(), withReduxState());
        await result.current('', '');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.REMOVE, group: '', name: '' });
        expect(request).not.toHaveBeenCalled();
    });
});
