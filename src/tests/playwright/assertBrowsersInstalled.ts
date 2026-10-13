import { existsSync } from 'node:fs';

import { chromium, firefox, webkit, type PlaywrightTestProject } from '@playwright/test';

const browsers = { chromium, firefox, webkit };

function requestedProjects(args: readonly string[]): string[] {
    return args.flatMap((arg, index) => {
        if (arg === '--project') {
            return args[index + 1] ? [args[index + 1]!] : [];
        }
        return arg.startsWith('--project=') ? [arg.slice('--project='.length)] : [];
    });
}

function matchesProject(name: string, pattern: string): boolean {
    const expression = pattern
        .split('*')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
    return new RegExp(`^${expression}$`, 'i').test(name);
}

export function assertBrowsersInstalled(
    projects: readonly PlaywrightTestProject[],
    args: readonly string[] = process.argv,
    hasExecutable: (path: string) => boolean = existsSync
): void {
    if (args.includes('--list')) {
        return;
    }

    const requested = requestedProjects(args);
    const selected = requested.length
        ? projects.filter((project) => requested.some((pattern) => matchesProject(project.name ?? '', pattern)))
        : projects;
    const required = new Set(selected.map((project) => project.use?.browserName ?? 'chromium'));
    const missing = [...required].filter((browser) => !hasExecutable(browsers[browser].executablePath()));

    if (missing.length) {
        const paths = missing.map((browser) => `  ${browser}: ${browsers[browser].executablePath()}`).join('\n');
        throw new Error(
            `Playwright browser executables are missing for this package version:\n${paths}\nRun: pnpm exec playwright install ${missing.join(' ')}`
        );
    }
}
