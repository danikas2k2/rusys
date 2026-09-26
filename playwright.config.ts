import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e/specs',
    // Every scenario resets the same temporary MongoDB. Parallel workers need separate servers.
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://127.0.0.1:3022',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: '**/mobile.spec.ts' },
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: '**/mobile.spec.ts' },
    ],
    globalTeardown: './e2e/setup/global-teardown.ts',
    webServer: {
        command: 'node --import tsx e2e/setup/start-server.ts',
        url: 'http://127.0.0.1:3022',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
