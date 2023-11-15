import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { FilterActionType } from '~/state/filter/actions';
import { useSetFilter } from '~/state/filter/useSetFilter';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetFilter', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('call set filter action', async () => {
        const { result } = renderHook(() => useSetFilter(), withReduxState());
        await result.current('filtered');
        expect(dispatch).toHaveBeenCalledWith({ type: FilterActionType.SET, filter: 'filtered' });
    });

    it('call set filter action with empty value', async () => {
        const { result } = renderHook(() => useSetFilter(), withReduxState());
        await result.current('');
        expect(dispatch).toHaveBeenCalledWith({ type: FilterActionType.SET, filter: '' });
    });
});
