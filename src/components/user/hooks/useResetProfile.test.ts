import { act, renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { useResetProfile } from '~/components/user/hooks/useResetProfile';
import { resetProfileAction } from '~/store/profile';

vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

describe('useResetProfile', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('dispatches resetProfileAction', () => {
        const { result } = renderHook(() => useResetProfile(), { wrapper: MockRedux });

        act(() => result.current());

        expect(dispatch).toHaveBeenCalledWith(resetProfileAction());
    });
});
