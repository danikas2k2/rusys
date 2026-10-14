import { ensureBrowsersInstalled } from '@tests/playwright/ensureBrowsersInstalled';

import { defineConfig, devices, type PlaywrightTestProject } from '@playwright/test';

const screenshotExpect = {
    animations: 'disabled' as const,
    caret: 'hide' as const,
    scale: 'css' as const,
    stylePath: './src/tests/visual.css',
};

const snapshotPathTemplate = '{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}{ext}';
const mobileInteractionTests = [
    '**/AppRouter.spec.ts',
    '**/AmountBox.spec.ts',
    '**/ProductYearBar.spec.ts',
    '**/ProductsPage.spec.ts',
    '**/ReviewBoxSafeArea.spec.ts',
    '**/Accessibility.spec.ts',
];

const browserProjects = [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: mobileInteractionTests },
    {
        name: 'mobile-webkit',
        use: { ...devices['iPhone 17'] },
        testMatch: mobileInteractionTests,
    },
] satisfies PlaywrightTestProject[];

ensureBrowsersInstalled(browserProjects);

export default defineConfig({
    testDir: './src',
    testMatch: '**/*.spec.ts',
    snapshotPathTemplate,
    workers: 1,
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
            ...screenshotExpect,
            pathTemplate: snapshotPathTemplate,
        },
    },
    projects: browserProjects,
    globalTeardown: './src/tests/playwright/global-teardown.ts',
    webServer: {
        command: 'node --import tsx src/tests/playwright/start-server.ts',
        url: 'http://127.0.0.1:3022',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
