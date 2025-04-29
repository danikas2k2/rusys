import { useDispatch } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { withReduxState } from '@tests/withReduxState';
import { FilterActionType } from '~/state/filter/actions';
import { useSetFilter } from '~/state/filter/useSetFilter';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useSetFilter', () => {
    const dispatch = jest.fn();

    beforeAll(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => jest.clearAllMocks());

    it('calls set filter action', () => {
        const { result } = renderHook(() => useSetFilter(), withReduxState());
        result.current('filtered');

        expect(dispatch).toHaveBeenCalledWith({ type: FilterActionType.SET, filter: 'filtered' });
    });

    it('calls set filter action with empty value', () => {
        const { result } = renderHook(() => useSetFilter(), withReduxState());
        result.current('');

        expect(dispatch).toHaveBeenCalledWith({ type: FilterActionType.SET, filter: '' });
    });
});
