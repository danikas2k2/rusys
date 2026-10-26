import { afterEach, describe, expect, it, vi } from 'vitest';

import { version as packageVersion } from '../package.json';

const collectorOrigin = 'https://faro-collector-test.grafana.net';
const collectorUrl = `${collectorOrigin}/collect/public-test-key`;

async function loadConfig(collector: string | undefined, mode: 'development' | 'production' = 'production') {
    vi.stubEnv('NEXT_PUBLIC_FARO_URL', collector);
    vi.stubEnv('NODE_ENV', mode);
    vi.resetModules();
    return (await import('../next.config')).default;
}

function expectedHeaders(mode: 'development' | 'production', origin = '') {
    const development = mode === 'development';
    return [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'Content-Security-Policy',
                    value: [
                        "default-src 'self'",
                        "img-src 'self' data: https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://*.googleusercontent.com https://www.gravatar.com https://secure.gravatar.com",
                        "style-src 'self' 'unsafe-inline' https://accounts.google.com",
                        "font-src 'self'",
                        `connect-src 'self' https://accounts.google.com https://openidconnect.googleapis.com https://www.googleapis.com${origin ? ` ${origin}` : ''}${development ? ' ws://localhost:3021 ws://127.0.0.1:3021' : ''}`,
                        "frame-src 'self' https://accounts.google.com",
                        `script-src 'self' 'unsafe-inline' https://accounts.google.com${development ? " 'unsafe-eval'" : ''}`,
                        "object-src 'none'",
                        ...(development ? [] : ['upgrade-insecure-requests']),
                    ].join('; '),
                },
                { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
                ...(development ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=15552000' }]),
            ],
        },
    ];
}

describe('faro build configuration', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it.each(['development', 'production'] as const)(
        'adds only the configured collector origin to connect-src in %s',
        async (mode) => {
            const config = await loadConfig(collectorUrl, mode);

            await expect(config.headers?.()).resolves.toStrictEqual(expectedHeaders(mode, collectorOrigin));
        }
    );

    it.each([
        undefined,
        '',
        'invalid',
        `http://faro-collector-test.grafana.net/collect/key`,
        `${collectorOrigin}.evil.test/collect/key`,
        `${collectorOrigin}:444/collect/key`,
        'https://user:password@faro-collector-test.grafana.net/collect/key',
        `${collectorUrl}?secret=value`,
        `${collectorUrl}#fragment`,
        `${collectorOrigin}/api/key`,
        `${collectorUrl}; connect-src *`,
    ])('retains existing production restrictions for invalid or absent collector %s', async (collector) => {
        const config = await loadConfig(collector);

        await expect(config.headers?.()).resolves.toStrictEqual(expectedHeaders('production'));
    });

    it('retains development security headers without a collector', async () => {
        const config = await loadConfig(undefined, 'development');

        await expect(config.headers?.()).resolves.toStrictEqual(expectedHeaders('development'));
    });

    it('embeds the release version supplied at build time', async () => {
        vi.stubEnv('APP_VERSION', '4.2.10-release.42');
        const config = await loadConfig(collectorUrl);

        expect(config.env).toStrictEqual({ NEXT_PUBLIC_APP_VERSION: '4.2.10-release.42' });
    });

    it.each([undefined, ''])('falls back to the package version for APP_VERSION=%s', async (version) => {
        vi.stubEnv('APP_VERSION', version);
        const config = await loadConfig(undefined);

        expect(config.env).toStrictEqual({ NEXT_PUBLIC_APP_VERSION: packageVersion });
    });
});
