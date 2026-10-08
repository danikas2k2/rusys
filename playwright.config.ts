import { defineConfig, devices, type PlaywrightTestProject } from '@playwright/test';

const screenshotExpect = {
    animations: 'disabled' as const,
    caret: 'hide' as const,
    scale: 'css' as const,
    stylePath: './src/tests/visual.css',
};

const visualTests = '**/*.snap.ts';
const visualRun = process.env.PLAYWRIGHT_VISUAL === '1';
const mobileInteractionTests = [
    '**/AppRouter.spec.ts',
    '**/AmountBox.spec.ts',
    '**/ProductYearBar.spec.ts',
    '**/ProductsPage.spec.ts',
    '**/ReviewBoxSafeArea.spec.ts',
    visualTests,
];

const browserProjects = [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: mobileInteractionTests },
    { name: 'tablet-chromium', use: { ...devices['Galaxy Tab S9'] }, testMatch: visualTests },
    {
        name: 'mobile-webkit',
        use: { ...devices['iPhone 17'] },
        testMatch: mobileInteractionTests,
    },
    { name: 'tablet-webkit', use: { ...devices['iPad Mini'] }, testMatch: visualTests },
] satisfies PlaywrightTestProject[];

export default defineConfig({
    testDir: './src',
    testMatch: ['**/*.spec.ts', '**/*.snap.ts'],
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'line',
    use: {
        baseURL: 'http://127.0.0.1:3022',
        colorScheme: 'light',
        locale: 'lt-LT',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    expect: {
        toHaveScreenshot: {
            ...screenshotExpect,
            pathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}{ext}',
        },
    },
    projects: [
        ...browserProjects,
        ...browserProjects.map((project) => ({
            ...project,
            name: `${project.name}-dark`,
            testMatch: visualTests,
            use: { ...project.use, colorScheme: 'dark' as const },
        })),
    ],
    globalTeardown: './src/tests/playwright/global-teardown.ts',
    webServer: {
        command: 'node --import tsx src/tests/playwright/start-server.ts',
        url: visualRun ? 'http://127.0.0.1:3022/manifest.json' : 'http://127.0.0.1:3022',
        reuseExistingServer: false,
        timeout: visualRun ? 240_000 : 120_000,
    },
});
