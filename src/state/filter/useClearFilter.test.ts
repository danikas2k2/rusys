import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { FilterActionType } from '~/state/filter/actions';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useClearFilter', () => {
    const dispatch = jest.fn();

    beforeAll(() => {
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
    });

    afterEach(() => jest.clearAllMocks());

    it('call set filter action', async () => {
        const { result } = renderHook(() => useClearFilter(), withReduxState());
        await result.current();
        expect(dispatch).toHaveBeenCalledWith({ type: FilterActionType.CLEAR });
    });
});
