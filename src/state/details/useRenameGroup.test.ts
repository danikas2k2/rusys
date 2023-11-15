import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useRenameGroup } from '~/state/details/useRenameGroup';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRenameGroup', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call rename action', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('G', 'H');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME_GROUP, group: 'G', newGroup: 'H' });
        expect(request).toHaveBeenCalledWith('/renameGroup', { group: 'G', newGroup: 'H' });
    });

    it('call rename action with same group', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('G', 'G');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('', 'G');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME_GROUP, group: '', newGroup: 'G' });
        expect(request).toHaveBeenCalledWith('/renameGroup', { group: '', newGroup: 'G' });
    });

    it('call rename action with empty new group', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('G', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call rename action with empty groups', async () => {
        const { result } = renderHook(() => useRenameGroup(), withReduxState());
        await result.current('', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
