import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
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
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls rename action', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', 'B');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME, group: 'G', name: 'A', newName: 'B' });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsRename, { group: 'G', name: 'A', newName: 'B' });
    });

    it('calls rename action with same name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', 'A');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('calls rename action with empty names', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', '', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('calls rename action with empty name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', '', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.RENAME, group: 'G', name: '', newName: 'A' });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsRename, { group: 'G', name: '', newName: 'A' });
    });

    it('calls rename action with empty new name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('G', 'A', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('calls rename action with empty group', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', 'A', 'B');
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.RENAME,
            group: 'J',
            name: 'A',
            newName: 'B',
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsRename, { group: 'J', name: 'A', newName: 'B' });
    });

    it('calls rename action with empty group and name', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', '', 'A');
        expect(dispatch).toHaveBeenCalledWith({
            type: DetailsActionType.RENAME,
            group: 'J',
            name: '',
            newName: 'A',
        });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsRename, { group: 'J', name: '', newName: 'A' });
    });

    it('calls rename action with empty group and names', async () => {
        const { result } = renderHook(() => useRenameDetails(), withReduxState());
        await result.current('', '', '');
        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
