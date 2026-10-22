import { act, renderHook } from '@testing-library/react';

import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { type PropsWithChildren } from 'react';

import { useLoginSuccess } from '~/components/user/hooks/useLoginSuccess';
import { useSetProfile } from '~/components/user/hooks/useSetProfile';
import { loginWithGoogle } from '~/server/actions/auth';
import { CATALOG_KEYS } from '~/store/catalog';

vi.mock(import('next/navigation'), () => ({ useRouter: vi.fn() }));
vi.mock(import('~/server/actions/auth'), () => ({ loginWithGoogle: vi.fn() }));
vi.mock(import('~/components/user/hooks/useSetProfile'));

const refresh = vi.fn();
const setProfile = vi.fn();
const wrapper = ({ children }: PropsWithChildren) =>
    React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

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
        const { result } = renderHook(() => useLoginSuccess(onError), { wrapper });
        await act(() => result.current({ credential: 'id-token' }));

        expect(loginWithGoogle).toHaveBeenCalledWith({ token: 'id-token', kind: 'id' });
        expect(setProfile).toHaveBeenCalledWith(profile);
        expect(refresh).toHaveBeenCalledWith();
        expect(onError).not.toHaveBeenCalled();
    });

    it('verifies a button access token on the server', async () => {
        vi.mocked(loginWithGoogle).mockResolvedValue({ sub: '123', email: 'user@example.com', allowed: true });
        const { result } = renderHook(() => useLoginSuccess(vi.fn()), { wrapper });
        await act(() => result.current({ access_token: 'access-token' } as any));

        expect(loginWithGoogle).toHaveBeenCalledWith({ token: 'access-token', kind: 'access' });
    });

    it('rejects a failed verification', async () => {
        vi.mocked(loginWithGoogle).mockRejectedValue(new Error('Unauthorized'));
        const onError = vi.fn();
        const { result } = renderHook(() => useLoginSuccess(onError), { wrapper });
        await act(() => result.current({ credential: 'bad-token' }));

        expect(setProfile).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith();
    });

    it('clears the prior account cache before exposing a newly signed-in profile', async () => {
        const client = new QueryClient();
        client.setQueryData(CATALOG_KEYS.groups, [{ group: 'Account A', order: 0 }]);
        const nextProfile = { sub: 'account-b', email: 'b@example.com', allowed: true };
        vi.mocked(loginWithGoogle).mockResolvedValue(nextProfile);
        vi.mocked(useSetProfile).mockReturnValue((profile) => {
            expect(profile).toStrictEqual(nextProfile);
            expect(client.getQueryData(CATALOG_KEYS.groups)).toBeUndefined();
        });
        const { result } = renderHook(() => useLoginSuccess(vi.fn()), {
            wrapper: ({ children }) => React.createElement(QueryClientProvider, { client }, children),
        });

        await act(() => result.current({ credential: 'account-b-token' }));

        expect(client.getQueryData(CATALOG_KEYS.groups)).toBeUndefined();
    });
});
