import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src',
    testMatch: ['**/*.spec.ts', '**/*.snap.ts'],
    testIgnore: '**/*.responsive.snap.ts',
    // Every scenario resets the same temporary MongoDB. Parallel workers need separate servers.
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://127.0.0.1:3022',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            stylePath: './src/tests/visual.css',
            pathTemplate: '{testDir}/{testFileDir}/.snapshots/{arg}-chromium{ext}',
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile-chromium',
            use: { ...devices['Pixel 7'] },
            testMatch: [
                '**/AppRouter.spec.ts',
                '**/AppRouter.snap.ts',
                '**/ProductsPage.snap.ts',
                '**/AmountBox.snap.ts',
                '**/SummaryPage.snap.ts',
                '**/GroupsPage.snap.ts',
            ],
        },
    ],
    globalTeardown: './src/tests/playwright/global-teardown.ts',
    webServer: {
        command: 'node --import tsx src/tests/playwright/start-server.ts',
        url: 'http://127.0.0.1:3022',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
