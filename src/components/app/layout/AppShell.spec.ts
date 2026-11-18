import { renderFixtureApp } from '@tests/browser/app';
import { describe, expect, test } from 'vitest';

import { page } from 'vitest/browser';

describe('reduced motion', { tags: ['component'] }, () => {
    test('disables CSS motion across the app and startup loader', async () => {
        await renderFixtureApp('/', 'history');
        await expect.element(page.getByText('Avietės', { exact: true })).toBeVisible();
        expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = '/assets/loader.css';
        const ready = new Promise<void>((resolve, reject) => {
            css.onload = () => resolve();
            css.onerror = () => reject(new Error('Startup loader stylesheet failed to load'));
        });
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.append(...Array.from({ length: 3 }, () => document.createElement('div')));
        document.head.append(css);
        document.body.append(loader);
        try {
            await ready;
            const moving = Array.from(document.querySelectorAll('body *')).filter((element) => {
                const style = getComputedStyle(element);
                return [style.animationDuration, style.transitionDuration].some((durations) =>
                    durations.split(',').some((duration) => parseFloat(duration) > 0)
                );
            });
            expect(moving.map((element) => element.outerHTML.slice(0, 100))).toStrictEqual([]);
        } finally {
            loader.remove();
            css.remove();
        }
    });
});
