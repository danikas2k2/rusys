import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useRenameDetails', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call rename action', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', 'B');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME, group: 'G', name: 'A', newName: 'B' });
        expect(request).toHaveBeenCalledWith('/rename', { group: 'G', name: 'A', newName: 'B' });
    });

    it('call rename action with same name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', 'A');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call rename action with empty names', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', '', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', '', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME, group: 'G', name: '', newName: 'A' });
        expect(request).toHaveBeenCalledWith('/rename', { group: 'G', name: '', newName: 'A' });
    });

    it('call rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('call rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', 'A', 'B');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME, group: '', name: 'A', newName: 'B' });
        expect(request).toHaveBeenCalledWith('/rename', { group: '', name: 'A', newName: 'B' });
    });

    it('call rename action with empty group and name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', '', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME, group: '', name: '', newName: 'A' });
        expect(request).toHaveBeenCalledWith('/rename', { group: '', name: '', newName: 'A' });
    });

    it('call rename action with empty group and names', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', '', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
