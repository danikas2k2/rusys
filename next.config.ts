import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV !== 'production';
const contentSecurityPolicy = [
    "default-src 'self'",
    "img-src 'self' data: https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://*.googleusercontent.com https://www.gravatar.com https://secure.gravatar.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://accounts.google.com https://openidconnect.googleapis.com https://www.googleapis.com${
        isDevelopment ? ' ws://localhost:3021 ws://127.0.0.1:3021' : ''
    }`,
    "frame-src 'self' https://accounts.google.com",
    `script-src 'self' 'unsafe-inline' https://accounts.google.com${isDevelopment ? " 'unsafe-eval'" : ''}`,
    "object-src 'none'",
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
    distDir: process.env.PLAYWRIGHT_TEST
        ? process.env.PLAYWRIGHT_VISUAL === '1'
            ? '.next-e2e-visual'
            : '.next-e2e'
        : '.next',
    output: 'standalone',
    serverExternalPackages: ['mongodb', 'sharp'],
    experimental: {
        serverActions: {
            bodySizeLimit: '210mb',
        },
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
