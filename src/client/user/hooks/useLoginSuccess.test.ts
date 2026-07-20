import { act, renderHook } from '@testing-library/react';

import { jwtDecode } from 'jwt-decode';

import { useEmailCheck } from '~/client/state/profile/useEmailCheck';
import { useSetProfile } from '~/client/state/profile/useSetProfile';
import { useLoginSuccess } from '~/client/user/hooks/useLoginSuccess';

vi.mock(import('~/client/state/profile/useEmailCheck'));
vi.mock(import('~/client/state/profile/useSetProfile'));
vi.mock(import('jwt-decode'));

describe('useLoginSuccess', () => {
    const setProfile = vi.fn();
    const emailCheck = vi.fn().mockResolvedValue(true);

    beforeAll(() => {
        // Jest (node) environment may not provide fetch; define it so vi.spyOn can work.
        if (!('fetch' in globalThis)) {
            Object.defineProperty(globalThis, 'fetch', {
                value: async () => ({ ok: true, json: async () => ({}) }),
                writable: true,
                configurable: true,
            });
        }
    });

    beforeEach(() => {
        vi.mocked(useSetProfile).mockReturnValue(setProfile);
        vi.mocked(useEmailCheck).mockReturnValue(emailCheck);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('sets profile and checks email when response contains valid data', async () => {
        vi.mocked(jwtDecode).mockReturnValue({ email: 'test.email@email.com' });

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'test' }));

        expect(setProfile).toHaveBeenCalledWith({ email: 'test.email@email.com' });
        expect(emailCheck).toHaveBeenCalledWith('test.email@email.com');
        expect(onError).not.toHaveBeenCalled();
    });

    it('calls onError when response does not contain valid data', async () => {
        vi.mocked(jwtDecode).mockReturnValue({});

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({}));

        expect(setProfile).not.toHaveBeenCalled();
        expect(emailCheck).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });

    it('sets profile and checks email when response contains TokenResponse with access_token', async () => {
        // access_token is not a JWT; we fetch userinfo instead
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ email: 'test.email@email.com', sub: '123' }),
        } as any);

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ access_token: 'test-token' } as any));

        expect(setProfile).toHaveBeenCalledWith({ email: 'test.email@email.com', sub: '123' });
        expect(emailCheck).toHaveBeenCalledWith('test.email@email.com');
        expect(onError).not.toHaveBeenCalled();
    });

    it('calls onError when decoded profile does not contain email', async () => {
        vi.mocked(jwtDecode).mockReturnValue({ name: 'Test User' });

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: 'test' }));

        expect(setProfile).not.toHaveBeenCalled();
        expect(emailCheck).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });

    it('calls onError when decoded profile from access_token does not contain email', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ name: 'Test User', sub: '123' }),
        } as any);

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ access_token: 'test-token' } as any));

        expect(setProfile).not.toHaveBeenCalled();
        expect(emailCheck).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });

    it('uses access_token when credential is undefined', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ email: 'test.email@email.com', sub: '123' }),
        } as any);

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: undefined, access_token: 'test-token' } as any));

        expect(setProfile).toHaveBeenCalledWith({ email: 'test.email@email.com', sub: '123' });
        expect(emailCheck).toHaveBeenCalledWith('test.email@email.com');
        expect(onError).not.toHaveBeenCalled();
    });

    it('uses access_token when credential is null', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ email: 'test.email@email.com', sub: '123' }),
        } as any);

        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError));
        await act(() => result.current({ credential: null, access_token: 'test-token' } as any));

        expect(setProfile).toHaveBeenCalledWith({ email: 'test.email@email.com', sub: '123' });
        expect(emailCheck).toHaveBeenCalledWith('test.email@email.com');
        expect(onError).not.toHaveBeenCalled();
    });
});
