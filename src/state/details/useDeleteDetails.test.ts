import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { ApiUrl } from '~/common/api';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { DetailsActionType } from '~/state/details/actions';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';
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
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('calls remove action', async () => {
        const { result } = renderHook(() => useDeleteDetails(), withReduxState());
        await result.current('G', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.DELETE, group: 'G', name: 'A' });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsDelete, { group: 'G', name: 'A' });
    });

    it('calls remove action with empty name', async () => {
        const { result } = renderHook(() => useDeleteDetails(), withReduxState());
        await result.current('G', '');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.DELETE, group: 'G', name: '' });
        expect(request).not.toHaveBeenCalled();
    });

    it('calls remove action with empty group', async () => {
        const { result } = renderHook(() => useDeleteDetails(), withReduxState());
        await result.current('', 'A');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.DELETE, group: 'J', name: 'A' });
        expect(request).toHaveBeenCalledWith(ApiUrl.DetailsDelete, { group: 'J', name: 'A' });
    });

    it('calls remove action with empty group and name', async () => {
        const { result } = renderHook(() => useDeleteDetails(), withReduxState());
        await result.current('', '');
        expect(dispatch).toHaveBeenCalledWith({ type: DetailsActionType.DELETE, group: 'J', name: '' });
        expect(request).not.toHaveBeenCalled();
    });
});
