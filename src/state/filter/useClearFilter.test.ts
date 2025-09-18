import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { FilterActionType } from '~/state/filter/actions';
import { useClearFilter } from '~/state/filter/useClearFilter';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useClearFilter', () => {
    const dispatch = jest.fn();

    beforeAll(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => jest.clearAllMocks());

    it('calls set filter action', () => {
        const { result } = renderHook(() => useClearFilter(), { wrapper: MockRedux });
        result.current();

        expect(dispatch).toHaveBeenCalledWith({ type: FilterActionType.CLEAR });
    });
});
