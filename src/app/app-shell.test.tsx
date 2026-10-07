import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getRequestLocale } from '~/server/requestLocale';
import AppPage from './[...path]/page';
import RootLayout, { generateMetadata, viewport } from './layout';
import pwaAssets from './pwa-assets.json';
import { PwaHead } from './PwaHead';

vi.mock(import('~/components/app/NextApp'), () => ({
    NextApp: () => <main>Application loaded</main>,
}));
vi.mock(import('~/server/data/initialAppData'), () => ({
    getInitialAppData: vi.fn().mockResolvedValue({ data: {}, resource: 'products' }),
}));
vi.mock(import('next/server'), () => ({ connection: vi.fn().mockResolvedValue(undefined) }));
vi.mock(import('~/server/requestLocale'), () => ({ getRequestLocale: vi.fn() }));

describe('next.js app shell', () => {
    it('renders all generated PWA links, metadata, and splash screens', () => {
        const markup = renderToStaticMarkup(<PwaHead />);

        for (const { href } of pwaAssets.links) {
            expect(markup).toContain(`href="${href}"`);
        }
        for (const { name, content } of pwaAssets.metas) {
            expect(markup).toContain(`name="${name}"`);
            expect(markup).toContain(`content="${content}"`);
        }
        for (const { href, media } of pwaAssets.splashScreens) {
            expect(markup).toContain(`href="${href}"`);
            expect(markup).toContain(`media="${media}"`);
        }
    });

    it('renders the Lithuanian document with application content and fonts', async () => {
        vi.mocked(getRequestLocale).mockResolvedValue('lt-LT');
        const markup = renderToStaticMarkup(await RootLayout({ children: await AppPage() }));

        expect(markup).toContain('<html lang="lt"');
        expect(markup).toContain('<main>Application loaded</main>');
        expect(markup).toContain('fonts.googleapis.com');
        await expect(generateMetadata()).resolves.toMatchObject({
            title: 'Rusio programėlė',
            description: 'Produktų ir atsargų apskaita',
            manifest: '/manifest.json',
        });
        expect(viewport.viewportFit).toBe('cover');
    });

    it('renders English document language and metadata', async () => {
        vi.mocked(getRequestLocale).mockResolvedValue('en-US');
        const markup = renderToStaticMarkup(await RootLayout({ children: <main>Application loaded</main> }));

        expect(markup).toContain('<html lang="en"');
        await expect(generateMetadata()).resolves.toMatchObject({
            title: 'Cellar',
            description: 'Product and inventory tracking',
        });
    });
});
