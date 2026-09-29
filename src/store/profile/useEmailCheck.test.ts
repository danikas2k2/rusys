import { renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useDispatch } from 'react-redux';

import { checkEmailAccess } from '~/server/actions/checkEmailAccess';
import { setAllowedAction } from '~/store/profile/actions';
import { useEmailCheck } from '~/store/profile/useEmailCheck';

vi.mock(import('~/server/actions/checkEmailAccess'));
vi.mock(import('react-redux'), async () => ({ ...(await vi.importActual('react-redux')), useDispatch: vi.fn() }));

describe('useEmailCheck', () => {
    const dispatch = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls user check', async () => {
        vi.mocked(checkEmailAccess).mockResolvedValueOnce(true);
        const { result } = renderHook(() => useEmailCheck(), { wrapper: MockRedux });
        await result.current('big.buddy@email.com');

        expect(checkEmailAccess).toHaveBeenCalledWith('big.buddy@email.com');
        expect(dispatch).toHaveBeenCalledWith(setAllowedAction(true));
    });

    it('calls user check with empty value', async () => {
        const { result } = renderHook(() => useEmailCheck(), { wrapper: MockRedux });
        await result.current('');

        expect(checkEmailAccess).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
