import path from 'node:path';
import { readFile } from 'node:fs/promises';

import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
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

// Playwright adds one SIGTERM listener per instance; the visual runner reaches four more at startup.
process.setMaxListeners(Math.max(process.getMaxListeners(), instances.length + 4));

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'visual-fixture-images',
            configureServer(server) {
                server.middlewares.use(async (request, response, next) => {
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
        include: ['src/**/*.snap.tsx'],
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
            instances,
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
