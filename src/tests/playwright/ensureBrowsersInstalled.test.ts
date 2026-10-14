import { chromium, devices, webkit, type PlaywrightTestProject } from '@playwright/test';

import { ensureBrowsersInstalled } from './ensureBrowsersInstalled';

const projects = [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 17'] } },
] satisfies PlaywrightTestProject[];

describe('ensureBrowsersInstalled', () => {
    it('installs missing browsers before continuing', () => {
        let installed = false;
        const install = vi.fn(() => {
            installed = true;
        });

        ensureBrowsersInstalled(projects, ['test'], () => installed, install);

        expect(install).toHaveBeenCalledExactlyOnceWith(['chromium', 'webkit']);
    });

    it('skips installation when the selected project browser is present', () => {
        const hasExecutable = vi.fn((path: string) => path === chromium.executablePath());
        const install = vi.fn();

        ensureBrowsersInstalled(projects, ['test', '--project', 'chromium'], hasExecutable, install);

        expect(hasExecutable).toHaveBeenCalledExactlyOnceWith(chromium.executablePath());
        expect(install).not.toHaveBeenCalled();
    });

    it('installs only the browser selected by a wildcard project filter', () => {
        let installed = false;
        const install = vi.fn(() => {
            installed = true;
        });
        const hasExecutable = vi.fn((path: string) => path === webkit.executablePath() && installed);

        ensureBrowsersInstalled(projects, ['test', '--project=*-webkit'], hasExecutable, install);

        expect(install).toHaveBeenCalledExactlyOnceWith(['webkit']);
        expect(hasExecutable).toHaveBeenCalledWith(webkit.executablePath());
        expect(hasExecutable).not.toHaveBeenCalledWith(chromium.executablePath());
    });

    it('prefers an explicit browser name over a device preset', () => {
        const hasExecutable = vi.fn(() => true);
        const install = vi.fn();
        const overridden = [{ name: 'overridden', use: { ...devices['iPhone 17'], browserName: 'chromium' as const } }];

        ensureBrowsersInstalled(overridden, ['test'], hasExecutable, install);

        expect(hasExecutable).toHaveBeenCalledExactlyOnceWith(chromium.executablePath());
        expect(install).not.toHaveBeenCalled();
    });

    it('defaults to Chromium when neither browser setting is specified', () => {
        const hasExecutable = vi.fn(() => true);
        const install = vi.fn();

        ensureBrowsersInstalled([{ name: 'default' }], ['test'], hasExecutable, install);

        expect(hasExecutable).toHaveBeenCalledExactlyOnceWith(chromium.executablePath());
        expect(install).not.toHaveBeenCalled();
    });

    it('fails once if installation leaves executables missing', () => {
        expect(() => ensureBrowsersInstalled(projects, ['test'], () => false, vi.fn())).toThrow(
            'Run: pnpm exec playwright install chromium webkit'
        );
    });

    it('allows listing tests without installed browsers', () => {
        const hasExecutable = vi.fn(() => false);
        const install = vi.fn();

        ensureBrowsersInstalled(projects, ['test', '--list'], hasExecutable, install);

        expect(hasExecutable).not.toHaveBeenCalled();
        expect(install).not.toHaveBeenCalled();
    });
});
