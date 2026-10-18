import { readFile } from 'node:fs/promises';

import postcss from 'postcss';
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
vi.mock(import('next/font/google'), () => ({
    Noto_Sans: () => ({ variable: 'noto-sans' }),
    Noto_Sans_Display: () => ({ variable: 'noto-sans-display' }),
    Noto_Sans_Mono: () => ({ variable: 'noto-sans-mono' }),
    Noto_Color_Emoji: () => ({ variable: 'noto-color-emoji' }),
}));

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
        const htmlClasses = markup.match(/<html[^>]* class="([^"]*)"/)?.[1].split(/\s+/);

        expect(markup).toContain('<html lang="lt"');
        expect(htmlClasses?.sort()).toStrictEqual(
            ['noto-color-emoji', 'noto-sans', 'noto-sans-display', 'noto-sans-mono'].sort()
        );
        expect(markup).toContain('<main>Application loaded</main>');
        expect(markup).toContain('<div class="pwa-top-blur-fix" aria-hidden="true"></div>');
        expect(markup).not.toContain('fonts.googleapis.com');
        expect(markup).not.toContain('fonts.gstatic.com');
        await expect(generateMetadata()).resolves.toMatchObject({
            title: 'Rūsys',
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

    it('uses Next font variables for text, headings, and monospace', async () => {
        const css = await readFile('src/styles/theme.css', 'utf8');

        expect(css).toContain('var(--font-noto-sans), var(--font-noto-color-emoji)');
        expect(css).toContain('var(--font-noto-sans-display)');
        expect(css).toContain('var(--font-noto-sans-mono)');
    });

    it('keeps viewport height responsive in standalone mode while scoping the top strip', async () => {
        const stylesheet = postcss.parse(await readFile('src/styles/globals.css', 'utf8'));
        let browserHeight: string | undefined;
        let standaloneHeight: string | undefined;
        let stripIsHidden = false;
        let standaloneStripIsNonInteractive = false;

        stylesheet.walkRules(':root', (rule) => {
            rule.walkAtRules('supports', (supports) => {
                if (supports.params === '(width: 100dvw)') {
                    supports.walkDecls('--area-height', (declaration) => {
                        browserHeight = declaration.value;
                    });
                }
            });
            rule.walkAtRules('media', (media) => {
                if (media.params === '(display-mode: standalone)') {
                    media.walkDecls('--area-height', (declaration) => {
                        standaloneHeight = declaration.value;
                    });
                }
            });
        });
        stylesheet.walkRules('.pwa-top-blur-fix', (rule) => {
            if (rule.parent?.type === 'root') {
                stripIsHidden = rule.nodes.some(
                    (node) => node.type === 'decl' && node.prop === 'display' && node.value === 'none'
                );
            }
            if (rule.parent?.type === 'atrule' && rule.parent.params === '(display-mode: standalone)') {
                standaloneStripIsNonInteractive = rule.nodes.some(
                    (node) => node.type === 'decl' && node.prop === 'pointer-events' && node.value === 'none'
                );
            }
        });

        expect(browserHeight).toBe('100dvh');
        expect(standaloneHeight).toBeUndefined();
        expect(stripIsHidden).toBe(true);
        expect(standaloneStripIsNonInteractive).toBe(true);
    });

    it('uses measured visual viewport height for an occluded dialog', async () => {
        const stylesheet = postcss.parse(await readFile('src/styles/globals.css', 'utf8'));
        let modalHeight: string | undefined;
        let modalMaxHeight: string | undefined;
        let keyboardAlignment: string | undefined;

        stylesheet.walkRules((rule) => {
            if (rule.selector.includes('.ui-Modal-content[data-keyboard-viewport]')) {
                rule.walkDecls('height', (declaration) => {
                    modalHeight = declaration.value;
                });
                rule.walkDecls('max-height', (declaration) => {
                    modalMaxHeight = declaration.value;
                });
            }
            if (rule.selector === '.ui-Modal-inner[data-keyboard-viewport]') {
                rule.walkDecls('align-items', (declaration) => {
                    keyboardAlignment = declaration.value;
                });
            }
        });

        expect(modalHeight).toBe('var(--keyboard-viewport-height)');
        expect(modalMaxHeight).toBe('var(--keyboard-viewport-height)');
        expect(keyboardAlignment).toBe('flex-start');
    });
});
