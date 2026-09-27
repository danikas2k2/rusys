import { defineConfig, devices } from '@playwright/test';

import config from './playwright.config';

const iPadMini = {
    ...devices['iPad Mini'],
    // The A17 Pro iPad mini is 744 CSS pixels wide in portrait.
    viewport: { width: 744, height: 1000 },
    screen: { width: 744, height: 1133 },
};

export default defineConfig({
    ...config,
    testMatch: '**/*.responsive.snap.ts',
    testIgnore: [],
    projects: [
        {
            name: 'iphone17-webkit',
            use: { ...devices['iPhone 17'] },
        },
        {
            name: 'ipadmini-webkit',
            use: { ...iPadMini },
        },
    ],
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            stylePath: './src/tests/visual.css',
            pathTemplate: '{testDir}/{testFileDir}/.snapshots/{arg}-{projectName}{ext}',
        },
    },
});
