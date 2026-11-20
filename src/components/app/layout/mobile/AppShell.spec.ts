import { renderFixtureApp } from '@tests/browser/app';
import { element, layoutCleanup, safeAreaInsets } from '@tests/browser/layout';
import { describe, expect, test } from 'vitest';

import { commands, page } from 'vitest/browser';

describe('mobile application layout', { tags: ['component'] }, () => {
    layoutCleanup();

    test('fits the app shell and menu within safe areas during rotation and resize', async () => {
        safeAreaInsets();
        await renderFixtureApp('/');
        await expect.element(page.getByText('Avietės', { exact: true })).toBeVisible();
        expect(getComputedStyle(document.documentElement).getPropertyValue('--area-height').trim()).toBe('100dvh');
        const shell = element('.ui-AppShell-root');
        const header = element('.ui-AppShell-header');
        const footer = element('.ui-AppShell-footer');
        const add = page.getByRole('button', { name: 'Pridėti' });
        const width = window.innerWidth;
        const height = window.innerHeight;
        expect(getComputedStyle(shell).position).toBe('fixed');
        expect(getComputedStyle(header).position).toBe('static');
        expect(shell.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
        expect(shell.getBoundingClientRect().right).toBeLessThanOrEqual(width);
        expect(header.getBoundingClientRect().top).toBeGreaterThanOrEqual(59);
        expect(shell.getBoundingClientRect().bottom).toBeCloseTo(height, 0);
        expect(footer.getBoundingClientRect().bottom).toBeCloseTo(height, 0);
        expect(height - add.element().getBoundingClientRect().bottom).toBeCloseTo(42, 0);

        await page.viewport(height, width);
        await expect.poll(() => footer.getBoundingClientRect().bottom).toBeCloseTo(width, 0);
        expect(header.getBoundingClientRect().top).toBeGreaterThanOrEqual(59);

        await page.viewport(width, height + 120);
        await expect.poll(() => footer.getBoundingClientRect().bottom).toBeCloseTo(height + 120, 0);
        expect(height + 120 - add.element().getBoundingClientRect().bottom).toBeCloseTo(42, 0);
        await commands.layoutTapButton('Meniu');
        const menu = page.getByRole('dialog', { name: 'Meniu' });
        await expect.element(menu).toBeVisible();
        await expect.poll(() => menu.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(height + 120);
    });

    test('fits the review actions and content inside simulated safe areas', async () => {
        safeAreaInsets();
        await renderFixtureApp('/', 'review');
        await commands.layoutTapButton('Peržiūra');
        const dialog = page.getByRole('dialog').last();
        const scroll = element('.ReviewBox-scroll', dialog.element());
        const close = dialog.getByRole('button', { name: 'Uždaryti' });
        const actions = element('.ReviewBox-actions', dialog.element());
        const apply = dialog.getByRole('button', { name: 'Taikyti' });
        expect(getComputedStyle(actions).paddingBottom).toBe('50px');
        expect(getComputedStyle(scroll).paddingLeft).toBe('12px');
        expect(getComputedStyle(scroll).paddingRight).toBe('12px');
        await expect.poll(() => close.element().getBoundingClientRect().top).toBeGreaterThanOrEqual(59);
        await expect
            .poll(() => apply.element().getBoundingClientRect().bottom)
            .toBeLessThanOrEqual(window.innerHeight - 34);
        expect(apply.element().getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth - 12);
    });

    test('aligns the product dialog with a simulated keyboard viewport', async () => {
        await renderFixtureApp('/');
        await commands.layoutTapButton('Pridėti');
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect.element(dialog).toBeVisible();
        const panel = dialog.element() as HTMLElement;
        expect(panel.getBoundingClientRect().top).toBeGreaterThan(0);

        panel.dataset.keyboardViewport = '';
        panel.style.setProperty('--keyboard-viewport-height', '300px');
        panel.parentElement!.dataset.keyboardViewport = '';
        panel.parentElement!.style.setProperty('--keyboard-viewport-top', '0px');

        await expect.poll(() => getComputedStyle(panel).height).toBe('300px');
        expect(panel.getBoundingClientRect().top).toBeCloseTo(0, 0);
    });

    test('keeps an edited quantity centered above the keyboard while typing', async () => {
        await renderFixtureApp('/');
        await page.getByText('Avietės', { exact: true }).click();
        const dialog = page.getByRole('dialog', { name: /Avietės Uogienės/ });
        await expect.element(dialog).toBeVisible();
        await dialog.getByRole('button', { expanded: false }).filter({ hasText: 'Stiklainis' }).click();

        const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
        const viewport = Object.assign(new EventTarget(), { height: window.innerHeight, offsetTop: 0, scale: 1 });
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
        try {
            const input = dialog.getByRole('textbox', { name: 'updated' });
            const scroller = element('.ui-Modal-body', dialog.element());
            await input.click();
            viewport.height = 300;
            viewport.dispatchEvent(new Event('resize'));

            const center = (node: Element) => {
                const { top, height } = node.getBoundingClientRect();
                return top + height / 2;
            };
            await expect.poll(() => Math.abs(center(input.element()) - center(scroller))).toBeLessThan(2);
            const position = scroller.scrollTop;
            await input.fill('12');
            viewport.dispatchEvent(new Event('scroll'));

            await expect.element(input).toHaveValue('12');
            await expect.element(input).toHaveFocus();
            expect(scroller.scrollTop).toBeCloseTo(position, 0);
            expect(Math.abs(center(input.element()) - center(scroller))).toBeLessThan(2);
        } finally {
            if (originalViewport) {
                Object.defineProperty(window, 'visualViewport', originalViewport);
            } else {
                Reflect.deleteProperty(window, 'visualViewport');
            }
        }
    });
});
