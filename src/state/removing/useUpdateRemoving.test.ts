import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { RemovingActionType } from '~/state/removing/actions';
import { useUpdateRemoving } from '~/state/removing/useUpdateRemoving';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useUpdateRemoving', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('call update action', async () => {
        const { result } = renderHook(() => useUpdateRemoving(), withReduxState());
        await result.current('G', 'A', 21, true);
        expect(dispatch).toHaveBeenCalledWith({
            type: RemovingActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            removing: true,
        });
        expect(request).toHaveBeenCalledWith('/setRemoving', {
            group: 'G',
            name: 'A',
            year: 21,
            removing: true,
        });
    });

    it('call update action with false', async () => {
        const { result } = renderHook(() => useUpdateRemoving(), withReduxState());
        await result.current('G', 'A', 21, false);
        expect(dispatch).toHaveBeenCalledWith({
            type: RemovingActionType.UPDATE,
            group: 'G',
            name: 'A',
            year: 21,
            removing: false,
        });
        expect(request).toHaveBeenCalledWith('/setRemoving', {
            group: 'G',
            name: 'A',
            year: 21,
            removing: false,
        });
    });
});
