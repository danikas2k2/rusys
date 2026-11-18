import path from 'node:path';
import { readFile } from 'node:fs/promises';

import react from '@vitejs/plugin-react';
import { defineBrowserCommand, playwright } from '@vitest/browser-playwright';
import { devices } from 'playwright';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;
const src = path.resolve(root, 'src');
const browsers = [
    { name: 'chromium', browser: 'chromium', device: devices['Desktop Chrome'] },
    { name: 'chromium-mobile', browser: 'chromium', device: devices['Pixel 7'] },
    { name: 'chromium-tablet', browser: 'chromium', device: devices['Galaxy Tab S9'] },
    { name: 'webkit-mobile', browser: 'webkit', device: devices['iPhone 17'] },
    { name: 'webkit-tablet', browser: 'webkit', device: devices['iPad Mini'] },
] as const;

const instances = browsers.flatMap(({ name, browser, device }) =>
    (['light', 'dark'] as const).map((theme) => ({
        name: theme === 'dark' ? `${name}-dark` : name,
        include: ['src/**/*.snap.tsx'],
        browser,
        viewport: device.viewport,
        provider: playwright({
            contextOptions: {
                deviceScaleFactor: device.deviceScaleFactor,
                hasTouch: device.hasTouch,
                isMobile: device.isMobile,
                userAgent: device.userAgent,
                locale: 'lt-LT',
                colorScheme: theme,
                reducedMotion: 'reduce',
            },
        }),
    }))
);

const componentInstances = instances
    .filter(({ name }) => name === 'chromium' || name === 'chromium-mobile' || name === 'webkit-mobile')
    .map((instance) => ({
        ...instance,
        name: `component-${instance.name}`,
        include: [instance.name === 'chromium' ? 'src/**/layout/*.spec.ts' : 'src/**/layout/mobile/*.spec.ts'],
    }));

// Playwright adds one SIGTERM listener per instance; Vitest adds four more at startup.
process.setMaxListeners(Math.max(process.getMaxListeners(), instances.length + componentInstances.length + 4));

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'visual-fixture-images',
            configureServer(server) {
                server.middlewares.use(async (request, response, next) => {
                    if (
                        request.method === 'POST' &&
                        new URL(request.url ?? '/', 'http://localhost').pathname === '/api/images'
                    ) {
                        request.resume();
                        response.setHeader('Content-Type', 'application/json');
                        response.end(JSON.stringify({ token: `upload:${'a'.repeat(64)}` }));
                        return;
                    }
                    const file = new URL(request.url ?? '/', 'http://localhost').pathname.match(
                        /^\/images\/(uogienes|darzoves|avietes|braskes|morkos)\.png$/
                    )?.[0];
                    if (!file) {
                        next();
                        return;
                    }
                    response.setHeader('Content-Type', 'image/png');
                    response.end(await readFile(path.resolve(root, 'src/tests/assets', path.basename(file))));
                });
            },
        },
    ],
    resolve: {
        dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
        alias: [
            {
                find: /^~\/server\/actions\/.*$/,
                replacement: path.resolve(root, 'src/tests/browser/server-actions.ts'),
            },
            { find: /^~\/(.*)$/, replacement: `${src}/$1` },
            { find: '@icons', replacement: `${src}/components/icons` },
            { find: /^@tests\/(.*)$/, replacement: `${src}/tests/$1` },
            { find: 'package.json', replacement: path.resolve(root, 'package.json') },
            { find: 'next/navigation', replacement: path.resolve(root, 'src/tests/browser/next-navigation.ts') },
            { find: 'next/image', replacement: path.resolve(root, 'src/tests/browser/next-image.tsx') },
            { find: 'next/link', replacement: path.resolve(root, 'src/tests/browser/next-link.tsx') },
            { find: 'next/headers', replacement: path.resolve(root, 'src/tests/browser/next-headers.ts') },
        ],
    },
    test: {
        include: ['src/**/*.snap.tsx', 'src/**/layout/**/*.spec.ts'],
        tags: [
            { name: 'component', description: 'Browser tests mounted with fixture data and stubbed server actions' },
        ],
        attachmentsDir: 'test-results',
        testTimeout: 30_000,
        fileParallelism: false,
        browser: {
            enabled: true,
            headless: true,
            ui: false,
            orchestratorScripts: [
                {
                    content: `const style = document.createElement('style');
style.textContent = 'iframe[data-vitest="true"] { position: fixed !important; inset: 0 !important; transform: none !important; }';
document.head.append(style);`,
                },
            ],
            provider: playwright(),
            instances: [...instances, ...componentInstances],
            commands: {
                layoutWheel: defineBrowserCommand(
                    async ({ page, frame }, delta: number, position?: { x: number; y: number }) => {
                        if (position) {
                            const bounds = await (await (await frame()).frameElement()).boundingBox();
                            if (!bounds) {
                                throw new Error('The layout test frame is not visible');
                            }
                            await page.mouse.move(bounds.x + position.x, bounds.y + position.y);
                        }
                        await page.mouse.wheel(0, delta);
                    }
                ),
                layoutTapButton: defineBrowserCommand(async ({ iframe }, name: string) => {
                    await iframe.getByRole('button', { name, exact: true }).tap();
                }),
                layoutReducedMotion: defineBrowserCommand(
                    async ({ page }, reducedMotion: 'reduce' | 'no-preference') => {
                        await page.emulateMedia({ reducedMotion });
                    }
                ),
            },
            expect: {
                toMatchScreenshot: {
                    screenshotOptions: { scale: 'css' },
                    resolveScreenshotPath: ({
                        arg,
                        ext,
                        platform,
                        project,
                        root,
                        screenshotDirectory,
                        testFileDirectory,
                        testFileName,
                    }) =>
                        path.resolve(
                            root,
                            testFileDirectory,
                            screenshotDirectory,
                            testFileName.replace(/\.snap\.tsx$/, ''),
                            `${arg}-${project.name}-${platform}${ext}`
                        ),
                },
            },
        },
    },
});
