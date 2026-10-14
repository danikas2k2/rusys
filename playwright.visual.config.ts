import { ensureBrowsersInstalled } from '@tests/playwright/ensureBrowsersInstalled';

import { defineConfig, devices, type PlaywrightTestProject } from '@playwright/test';

const snapshotPathTemplate = '{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}{ext}';
const browserProjects = [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'tablet-chromium', use: { ...devices['Galaxy Tab S9'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 17'] } },
    { name: 'tablet-webkit', use: { ...devices['iPad Mini'] } },
] satisfies PlaywrightTestProject[];
const projects = [
    ...browserProjects,
    ...browserProjects.map((project) => ({
        ...project,
        name: `${project.name}-dark`,
        use: { ...project.use, colorScheme: 'dark' as const },
    })),
];

ensureBrowsersInstalled(projects);

export default defineConfig({
    testDir: './src',
    testMatch: '**/*.snap.ts',
    snapshotPathTemplate,
    workers: 2,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'line',
    use: {
        baseURL: 'http://127.0.0.1:3022',
        colorScheme: 'light',
        locale: 'lt-LT',
        reducedMotion: 'reduce',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            stylePath: './src/tests/visual.css',
            pathTemplate: snapshotPathTemplate,
        },
    },
    projects,
    globalTeardown: './src/tests/playwright/global-teardown.ts',
    webServer: {
        command: 'node --import tsx src/tests/playwright/start-visual-server.ts',
        url: 'http://127.0.0.1:3022/manifest.json',
        reuseExistingServer: false,
        timeout: 240_000,
        gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    },
});
