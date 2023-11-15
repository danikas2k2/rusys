import { act, renderHook } from '@testing-library/react';
import { jwtDecode } from 'jwt-decode';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';
import { useEmailCheck } from '~/state/profile/useEmailCheck';
import { useSetProfile } from '~/state/profile/useSetProfile';

jest.mock('~/state/profile/useEmailCheck');
jest.mock('~/state/profile/useSetProfile');
jest.mock('jwt-decode');

describe('useLoginSuccess', () => {
    const setProfile = jest.fn();
    const emailCheck = jest.fn().mockResolvedValue(true);

    beforeAll(() => {
        (useSetProfile as jest.Mock).mockReturnValue(setProfile);
        (useEmailCheck as jest.Mock).mockReturnValue(emailCheck);
    });

    afterEach(() => jest.clearAllMocks());

    it('sets profile and checks email when response contains valid data', async () => {
        (jwtDecode as jest.Mock).mockReturnValue({ email: 'test.email@email.com' });

        const onError = jest.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'test' }));

        expect(setProfile).toHaveBeenCalled();
        expect(emailCheck).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });

    it('calls onError when response does not contain valid data', async () => {
        (jwtDecode as jest.Mock).mockReturnValue({});

        const onError = jest.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({}));

        expect(setProfile).not.toHaveBeenCalled();
        expect(emailCheck).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
    });
});
