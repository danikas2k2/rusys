import path from 'node:path';

import { test as base, expect } from './test';

const imageFiles = new Set(['uogienes.png', 'darzoves.png', 'avietes.png', 'braskes.png', 'morkos.png']);

export const test = base.extend<{ _visualData: void }>({
    _visualData: [
        async ({ context, scenario }, run) => {
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
        },
        { auto: true },
    ],
});

export { expect };
