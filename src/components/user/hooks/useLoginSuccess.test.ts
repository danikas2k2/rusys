import { act, renderHook } from '@testing-library/react';

import { useRouter } from 'next/navigation';

import { useLoginSuccess } from '~/components/user/hooks/useLoginSuccess';
import { loginWithGoogle } from '~/server/actions/auth';
import { useSetProfile } from '~/store/profile/useSetProfile';

vi.mock(import('next/navigation'), () => ({ useRouter: vi.fn() }));
vi.mock(import('~/server/actions/auth'), () => ({ loginWithGoogle: vi.fn() }));
vi.mock(import('~/store/profile/useSetProfile'));

const refresh = vi.fn();
const setProfile = vi.fn();

describe('useLoginSuccess', () => {
    beforeEach(() => {
        vi.mocked(useRouter).mockReturnValue({ refresh } as any);
        vi.mocked(useSetProfile).mockReturnValue(setProfile);
    });

    afterEach(() => vi.clearAllMocks());

    it('verifies an ID token on the server and refreshes SSR data', async () => {
        const profile = { sub: '123', email: 'user@example.com', allowed: true };
        vi.mocked(loginWithGoogle).mockResolvedValue(profile);
        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'id-token' }));

        expect(loginWithGoogle).toHaveBeenCalledWith('id-token', 'id');
        expect(setProfile).toHaveBeenCalledWith(profile);
        expect(refresh).toHaveBeenCalledWith();
        expect(onError).not.toHaveBeenCalled();
    });

    it('verifies a button access token on the server', async () => {
        vi.mocked(loginWithGoogle).mockResolvedValue({ sub: '123', email: 'user@example.com', allowed: true });
        const { result } = renderHook(() => useLoginSuccess(vi.fn()));
        await act(() => result.current({ access_token: 'access-token' } as any));

        expect(loginWithGoogle).toHaveBeenCalledWith('access-token', 'access');
    });

    it('rejects a failed verification', async () => {
        vi.mocked(loginWithGoogle).mockRejectedValue(new Error('Unauthorized'));
        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'bad-token' }));

        expect(setProfile).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });
});
