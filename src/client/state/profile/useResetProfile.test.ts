import { act, renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { resetProfileAction } from '~/client/state/profile/actions';
import { useResetProfile } from '~/client/state/profile/useResetProfile';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

describe('useResetProfile', () => {
    const dispatch = jest.fn();

    beforeAll(() => jest.mocked(useDispatch).mockReturnValue(dispatch));

    afterEach(() => jest.clearAllMocks());

    it('dispatches resetProfileAction', () => {
        const { result } = renderHook(() => useResetProfile(), { wrapper: MockRedux });

        act(() => result.current());

        expect(dispatch).toHaveBeenCalledWith(resetProfileAction());
    });
});
