import { act, renderHook } from '@testing-library/react';

import { jwtDecode } from 'jwt-decode';

import { useEmailCheck } from '~/client/state/profile/useEmailCheck';
import { useSetProfile } from '~/client/state/profile/useSetProfile';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';

jest.mock('~/client/state/profile/useEmailCheck');
jest.mock('~/client/state/profile/useSetProfile');
jest.mock('jwt-decode');

describe('useLoginSuccess', () => {
    const setProfile = jest.fn();
    const emailCheck = jest.fn().mockResolvedValue(true);

    beforeAll(() => {
        jest.mocked(useSetProfile).mockReturnValue(setProfile);
        jest.mocked(useEmailCheck).mockReturnValue(emailCheck);
    });

    afterEach(() => jest.clearAllMocks());

    it('sets profile and checks email when response contains valid data', async () => {
        jest.mocked(jwtDecode).mockReturnValue({ email: 'test.email@email.com' });

        const onError = jest.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'test' }));

        expect(setProfile).toHaveBeenCalledWith({ email: 'test.email@email.com' });
        expect(emailCheck).toHaveBeenCalledWith('test.email@email.com');
        expect(onError).not.toHaveBeenCalled();
    });

    it('calls onError when response does not contain valid data', async () => {
        jest.mocked(jwtDecode).mockReturnValue({});

        const onError = jest.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({}));

        expect(setProfile).not.toHaveBeenCalled();
        expect(emailCheck).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });

    it('sets profile and checks email when response contains TokenResponse with access_token', async () => {
        jest.mocked(jwtDecode).mockReturnValue({ email: 'test.email@email.com' });

        const onError = jest.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ access_token: 'test-token' } as any));

        expect(setProfile).toHaveBeenCalledWith({ email: 'test.email@email.com' });
        expect(emailCheck).toHaveBeenCalledWith('test.email@email.com');
        expect(onError).not.toHaveBeenCalled();
    });

    it('calls onError when decoded profile does not contain email', async () => {
        jest.mocked(jwtDecode).mockReturnValue({ name: 'Test User' });

        const onError = jest.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'test' }));

        expect(setProfile).not.toHaveBeenCalled();
        expect(emailCheck).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });
});
