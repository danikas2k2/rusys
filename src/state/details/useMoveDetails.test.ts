import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useMoveDetails } from '~/state/details/useMoveDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useMoveDetails', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call move action', async () => {
        const { result } = renderHook(() => useMoveDetails(), withReduxState());
        await result.current('G', 'A', 'H');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.MOVE, group: 'G', name: 'A', newGroup: 'H' });
        expect(request).toHaveBeenCalledWith('/move', { group: 'G', name: 'A', newGroup: 'H' });
    });

    it('call move action with same name', async () => {
        const { result } = renderHook(() => useMoveDetails(), withReduxState());
        await result.current('G', 'A', 'G');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call move action with empty name', async () => {
        const { result } = renderHook(() => useMoveDetails(), withReduxState());
        await result.current('G', '', 'H');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call move action with empty group', async () => {
        const { result } = renderHook(() => useMoveDetails(), withReduxState());
        await result.current('', 'A', 'H');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.MOVE, group: '', name: 'A', newGroup: 'H' });
        expect(request).toHaveBeenCalledWith('/move', { group: '', name: 'A', newGroup: 'H' });
    });
});
