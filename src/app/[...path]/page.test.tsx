import { createHash } from 'node:crypto';

import { connection } from 'next/server';
import React from 'react';

import { isDevMode } from '~/common/utils/dev';
import { NextApp } from '~/components/app/NextApp';
import { getSessionProfile } from '~/server/auth/session';
import { getInitialAppData } from '~/server/data/initialAppData';
import AppPage from './page';

vi.mock(import('next/server'), () => ({ connection: vi.fn() }));
vi.mock(import('~/common/utils/dev'), () => ({ DEV_CLIENT_ID: 'dev-client', isDevMode: vi.fn() }));
vi.mock(import('~/components/app/NextApp'), () => ({ NextApp: vi.fn(() => <div />) }));
vi.mock(import('~/server/auth/session'), () => ({ getSessionProfile: vi.fn() }));
vi.mock(import('~/server/data/initialAppData'), () => ({ getInitialAppData: vi.fn() }));

describe('appPage initial data', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllEnvs();
    });

    it('loads route data for a signed-in user and keys the app by its data version', async () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', 'configured-client');
        const profile = { sub: 'user', email: 'user@example.com' };
        const data = { groups: [{ group: 'A', order: 0 }] };
        vi.mocked(getSessionProfile).mockResolvedValueOnce(profile);
        vi.mocked(getInitialAppData).mockResolvedValueOnce({ data, resource: 'groups', initialGroup: 'A' });

        const page = await AppPage({ params: Promise.resolve({ path: ['categories'] }) });
        const hash = createHash('sha256').update(JSON.stringify(data)).digest('hex');

        expect(connection).toHaveBeenCalledExactlyOnceWith();
        expect(getInitialAppData).toHaveBeenCalledExactlyOnceWith('/categories');
        expect(page.key).toBe(`/categories:user:${hash}`);
        expect(page.props).toMatchObject({
            clientId: 'configured-client',
            profile,
            initialData: data,
            initialGroup: 'A',
            initialResource: 'groups',
        });
        expect(page.type).toBe(NextApp);
    });

    it('renders a guest without querying private data and uses the development client ID', async () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', undefined);
        vi.mocked(isDevMode).mockReturnValueOnce(true);
        vi.mocked(getSessionProfile).mockResolvedValueOnce(undefined);

        const page = await AppPage();

        expect(getInitialAppData).not.toHaveBeenCalled();
        expect(page.props).toMatchObject({ clientId: 'dev-client', profile: undefined, initialData: undefined });
    });

    it('omits a client ID outside development when none is configured', async () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', undefined);
        vi.mocked(isDevMode).mockReturnValueOnce(false);
        vi.mocked(getSessionProfile).mockResolvedValueOnce(undefined);

        const page = await AppPage({ params: Promise.resolve({}) });

        expect(page.props.clientId).toBeUndefined();
    });
});
