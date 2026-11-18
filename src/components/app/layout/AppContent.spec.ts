import { renderFixtureApp } from '@tests/browser/app';
import { describe, expect, test } from 'vitest';

import { cleanup } from 'vitest-browser-react';
import { page } from 'vitest/browser';

describe('application states with fixture data', { tags: ['component'] }, () => {
    test('restores the saved theme when the application is mounted again', async () => {
        const key = 'mantine-color-scheme-value';
        const original = localStorage.getItem(key);
        localStorage.setItem(key, 'light');
        try {
            await renderFixtureApp('/');
            await page.getByRole('button', { name: 'Meniu' }).click();
            const darkMode = page.getByRole('switch', { name: 'Tamsi tema' });
            const label = darkMode.element().id;
            document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(label)}"]`)!.click();
            await expect.element(page.getByRole('switch', { name: 'Šviesi tema' })).toBeChecked();
            expect(localStorage.getItem(key)).toBe('dark');

            await cleanup();
            await renderFixtureApp('/');
            await page.getByRole('button', { name: 'Meniu' }).click();
            await expect.element(page.getByRole('switch', { name: 'Šviesi tema' })).toBeChecked();
        } finally {
            if (original === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, original);
            }
        }
    });

    test.each(['/', '/variants', '/categories'])('shows the empty state at %s', async (route) => {
        await renderFixtureApp(route, 'empty');
        await expect.element(page.getByText('Duomenų nėra', { exact: true }).first()).toBeVisible();
    });

    test.each([
        { route: '/', query: 'Braškės', matching: 'Braškės', other: 'Avietės' },
        { route: '/variants', query: 'indelis', matching: 'Didelis indelis', other: 'Stiklainis' },
        { route: '/categories', query: 'Daržovės', matching: 'Daržovės', other: 'Uogienės' },
    ])('applies and clears quick search at $route', async ({ route, query, matching, other }) => {
        await renderFixtureApp(route);
        const search = page.getByRole('searchbox', { name: 'filtruokite' });
        const entry = (name: string) =>
            route === '/' ? page.getByText(name, { exact: true }) : page.getByRole('row', { name: new RegExp(name) });
        const content = entry(other);
        await expect.element(content).toBeVisible();

        await search.fill(query);
        await expect.poll(() => content.query()).toBeNull();
        await expect.element(entry(matching)).toBeVisible();

        await search.fill('');
        await expect.element(content).toBeVisible();
    });
});
