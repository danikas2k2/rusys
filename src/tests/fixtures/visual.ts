import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { test as base, expect } from '@playwright/test';

import type { Scenario } from './data';

const imageFiles = new Set(['uogienes.png', 'darzoves.png', 'avietes.png', 'braskes.png', 'morkos.png']);
const hydrationWarning =
    /Hydration failed|hydration mismatch|server rendered (?:HTML|text) didn't match|hydrated but some attributes of the server rendered HTML didn't match/i;

export const test = base.extend<{ scenario: Scenario; _visualData: void }>({
    scenario: ['basic', { option: true }],
    _visualData: [
        async ({ context, page, scenario }, run) => {
            const hydrationWarnings: string[] = [];
            const visualCss = await readFile(path.resolve(process.cwd(), 'src/tests/visual.css'), 'utf8');
            await context.addInitScript((css) => {
                const stylesheet = new CSSStyleSheet();
                stylesheet.replaceSync(css);
                document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
            }, visualCss);
            page.on('console', (message) => {
                if (hydrationWarning.test(message.text())) {
                    hydrationWarnings.push(message.text());
                }
            });
            page.on('pageerror', (error) => {
                if (hydrationWarning.test(error.message)) {
                    hydrationWarnings.push(error.message);
                }
            });
            await context.addCookies([
                { name: 'rusys_visual_scenario', value: scenario, url: 'http://127.0.0.1:3022' },
            ]);
            await context.route('**/images/*', async (route) => {
                const file = path.basename(new URL(route.request().url()).pathname);
                if (!imageFiles.has(file)) {
                    await route.abort();
                    return;
                }
                await route.fulfill({
                    path: path.resolve(process.cwd(), 'src/tests/assets', file),
                    contentType: 'image/png',
                });
            });
            await run();
            expect(hydrationWarnings, 'Visual pages must hydrate without warnings').toEqual([]);
        },
        { auto: true },
    ],
});

export { expect };
