import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import AppPage from './[...path]/page';
import RootLayout, { metadata, viewport } from './layout';
import pwaAssets from './pwa-assets.json';
import { PwaHead } from './PwaHead';

vi.mock(import('~/components/app/NextApp'), () => ({
    NextApp: () => <main>Application loaded</main>,
}));
vi.mock(import('~/server/data/initialAppData'), () => ({
    getInitialAppData: vi.fn().mockResolvedValue({ data: {}, resource: 'products' }),
}));
vi.mock(import('next/server'), () => ({ connection: vi.fn().mockResolvedValue(undefined) }));

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
        const markup = renderToStaticMarkup(<RootLayout>{await AppPage()}</RootLayout>);

        expect(markup).toContain('<html lang="lt"');
        expect(markup).toContain('<main>Application loaded</main>');
        expect(markup).toContain('fonts.googleapis.com');
        expect(metadata.manifest).toBe('/manifest.json');
        expect(viewport.viewportFit).toBe('cover');
    });
});
