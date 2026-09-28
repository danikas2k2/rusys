import { defineConfig, devices, type PlaywrightTestProject } from '@playwright/test';

const screenshotExpect = {
    animations: 'disabled' as const,
    caret: 'hide' as const,
    scale: 'css' as const,
    stylePath: './src/tests/visual.css',
};

const visualTests = '**/*.snap.ts';
const mobileInteractionTests = [
    '**/AppRouter.spec.ts',
    '**/AmountBox.spec.ts',
    '**/ProductYearBar.spec.ts',
    '**/ProductsPage.spec.ts',
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
    // Every scenario resets the same temporary MongoDB. Parallel workers need separate servers.
    workers: 1,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://127.0.0.1:3022',
        colorScheme: 'light',
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
        url: 'http://127.0.0.1:3022',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
