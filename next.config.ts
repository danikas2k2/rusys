import type { NextConfig } from 'next';

import { version as packageVersion } from './package.json';
import { faroCollectorUrl } from './src/common/faroConfig';

const collector = faroCollectorUrl(process.env.NEXT_PUBLIC_FARO_URL);
const collectorOrigin = collector ? new URL(collector).origin : '';

const isDevelopment = process.env.NODE_ENV !== 'production';
const contentSecurityPolicy = [
    "default-src 'self'",
    "img-src 'self' data: https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://*.googleusercontent.com https://www.gravatar.com https://secure.gravatar.com",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "font-src 'self'",
    `connect-src 'self' https://accounts.google.com https://openidconnect.googleapis.com https://www.googleapis.com${collectorOrigin ? ` ${collectorOrigin}` : ''}${
        isDevelopment ? ' ws://localhost:3021 ws://127.0.0.1:3021' : ''
    }`,
    "frame-src 'self' https://accounts.google.com",
    `script-src 'self' 'unsafe-inline' https://accounts.google.com${isDevelopment ? " 'unsafe-eval'" : ''}`,
    "object-src 'none'",
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
    distDir: process.env.PLAYWRIGHT_TEST ? '.next-e2e' : '.next',
    output: 'standalone',
    env: { NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || packageVersion },
    serverExternalPackages: ['mongodb', 'sharp'],
    experimental: {
        serverActions: {
            bodySizeLimit: '210mb',
        },
        useLightningcss: true,
        lightningCssFeatures: {
            exclude: ['light-dark'],
        },
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Content-Security-Policy', value: contentSecurityPolicy },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
                    ...(isDevelopment
                        ? []
                        : [
                              {
                                  key: 'Strict-Transport-Security',
                                  value: 'max-age=15552000',
                              },
                          ]),
                ],
            },
        ];
    },
};

export default nextConfig;
