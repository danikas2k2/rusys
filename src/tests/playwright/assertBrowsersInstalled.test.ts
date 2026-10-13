import { chromium, webkit, type PlaywrightTestProject } from '@playwright/test';

import { assertBrowsersInstalled } from './assertBrowsersInstalled';

const projects = [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile-webkit', use: { browserName: 'webkit' } },
] satisfies PlaywrightTestProject[];

describe('assertBrowsersInstalled', () => {
    it('fails once with the install command for missing browsers', () => {
        expect(() => assertBrowsersInstalled(projects, ['test'], () => false)).toThrow(
            'Run: pnpm exec playwright install chromium webkit'
        );
    });

    it('checks only the selected project browser', () => {
        const hasExecutable = vi.fn((path: string) => path === chromium.executablePath());

        expect(() => assertBrowsersInstalled(projects, ['test', '--project', 'chromium'], hasExecutable)).not.toThrow();
        expect(hasExecutable).toHaveBeenCalledExactlyOnceWith(chromium.executablePath());
    });

    it('supports project filters written with equals or wildcards', () => {
        const hasExecutable = vi.fn((path: string) => path === webkit.executablePath());

        expect(() => assertBrowsersInstalled(projects, ['test', '--project=*-webkit'], hasExecutable)).not.toThrow();
        expect(hasExecutable).toHaveBeenCalledExactlyOnceWith(webkit.executablePath());
    });

    it('allows listing tests without installed browsers', () => {
        const hasExecutable = vi.fn(() => false);

        expect(() => assertBrowsersInstalled(projects, ['test', '--list'], hasExecutable)).not.toThrow();
        expect(hasExecutable).not.toHaveBeenCalled();
    });
});
