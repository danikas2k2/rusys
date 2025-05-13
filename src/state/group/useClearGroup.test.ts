import { useDispatch } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { GroupActionType } from '~/state/group/actions';
import { useClearGroup } from '~/state/group/useClearGroup';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useClearGroup', () => {
    const dispatch = jest.fn();

    beforeAll(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => jest.clearAllMocks());

    it('calls set group action', () => {
        const { result } = renderHook(() => useClearGroup(), { wrapper: MockRedux });
        result.current();

        expect(dispatch).toHaveBeenCalledWith({ type: GroupActionType.CLEAR });
    });
});
