import { renderFixtureApp } from '@tests/browser/app';
import { element, layoutCleanup } from '@tests/browser/layout';
import { currentYear } from '@tests/fixtures/data';
import { describe, expect, test, vi } from 'vitest';

import { commands, page } from 'vitest/browser';

async function openReview() {
    await page.getByRole('button', { name: 'Peržiūra' }).click();
    return page.getByRole('dialog').last();
}

async function renderReview(jamCount: number, vegetableCount: number) {
    await renderFixtureApp('/', 'review', (data) => ({
        ...data,
        products: [
            ...data.products!,
            ...[
                { group: 'Uogienės', count: jamCount },
                { group: 'Daržovės', count: vegetableCount },
            ].flatMap(({ group, count }) =>
                Array.from({ length: count }, (_, index) => ({
                    group,
                    name: `${group} ${index}`,
                    years: [{ year: currentYear, amounts: [] }],
                }))
            ),
        ],
    }));
}

describe('review layout', { tags: ['component'] }, () => {
    layoutCleanup();

    test('lays out filtered products in columns without gaps', async () => {
        await page.viewport(1300, 800);
        await renderReview(6, 0);
        const review = await openReview();
        await review.getByRole('searchbox').fill('Uogienės ');
        const rows = () => Array.from(review.element().querySelectorAll('tbody tr[data-hidden="false"]'));
        await expect.poll(() => rows().length).toBe(6);
        const boxes = rows().map((row) => row.getBoundingClientRect());
        expect(boxes[1].x).toBe(boxes[0].x);
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
        expect(boxes[2].x).toBeGreaterThan(boxes[0].x);
        expect(boxes[2].y).toBe(boxes[0].y);
        expect(boxes[4].x).toBeGreaterThan(boxes[2].x);
        expect(boxes[4].y).toBe(boxes[0].y);
    });

    test('keeps the filter header in place across short and long categories', async () => {
        await page.viewport(390, 700);
        await renderReview(2, 35);
        const review = await openReview();
        await expect.element(review.getByRole('row', { name: /Uogienės 0/ })).toBeVisible();
        const scroll = element('.ReviewBox-scroll', review.element());
        const chrome = () => {
            const header = element('.ui-Modal-header', review.element()).getBoundingClientRect();
            const filter = element('.ReviewBox-filter', review.element()).getBoundingClientRect();
            const close = review.getByRole('button', { name: 'Uždaryti' }).element().getBoundingClientRect();
            return [header.y, header.height, filter.y, close.y];
        };
        expect(scroll.scrollHeight - scroll.clientHeight).toBe(0);
        const before = chrome();

        await review.getByRole('tab', { name: 'Daržovės' }).click();
        await expect.element(review.getByRole('row', { name: /Daržovės 0/ })).toBeVisible();
        await expect.poll(() => scroll.scrollHeight - scroll.clientHeight).toBeGreaterThan(0);
        expect(chrome()).toStrictEqual(before);
    });

    test('clips the category fade inside the scrollport and keeps the review header fixed', async () => {
        await page.viewport(390, 700);
        await commands.layoutReducedMotion('no-preference');
        await renderReview(35, 35);
        const review = await openReview();
        await expect.element(review.getByRole('row', { name: /Uogienės 0/ })).toBeVisible();
        const heading = review.getByRole('heading', { name: 'Uogienės', level: 1 });
        await expect.element(heading).toHaveLength(1);
        expect(review.element().querySelector('[data-category-heading]')).toBeNull();
        await Promise.allSettled(
            review
                .element()
                .getAnimations()
                .map((animation) => animation.finished)
        );
        const scroll = element('.ReviewBox-scroll', review.element());
        scroll.scrollTop = 250;
        await expect.poll(() => scroll.scrollTop).toBeGreaterThan(0);
        await expect.element(heading).toBeVisible();

        const transition = vi.spyOn(document, 'startViewTransition');
        const content = element('.CategoryRailLayout-content', review.element());
        const animate = content.animate.bind(content);
        vi.spyOn(content, 'animate').mockImplementation((frames, options) =>
            animate(frames, { ...(options as KeyframeAnimationOptions), duration: 2000 })
        );
        expect(getComputedStyle(scroll).overflowY).toBe('auto');
        const close = review.getByRole('button', { name: 'Uždaryti' });
        const before = close.element().getBoundingClientRect().toJSON();

        await review.getByRole('tab', { name: 'Daržovės' }).click();
        await expect.element(review.getByRole('row', { name: /Daržovės 0/ })).toBeVisible();
        await expect.element(review.getByRole('heading', { name: 'Daržovės', level: 1 })).toHaveLength(1);
        await expect.poll(() => content.getAnimations().length).toBeGreaterThan(0);
        expect(transition).not.toHaveBeenCalled();
        expect(content.closest('.ReviewBox-scroll')).toBe(scroll);
        await expect.element(close).toBeVisible();
        expect(close.element().getBoundingClientRect().toJSON()).toStrictEqual(before);
    });

    test('places the review tooltip to the left of its button', async () => {
        await renderFixtureApp('/', 'review');
        const button = page.getByRole('button', { name: 'Peržiūra' });
        await button.unhover();
        await button.hover();
        const tooltip = page.getByRole('tooltip', { name: 'Peržiūra' });
        await expect.element(tooltip).toBeVisible();
        await expect
            .poll(() => tooltip.element().getBoundingClientRect().right - button.element().getBoundingClientRect().left)
            .toBeLessThanOrEqual(0);
    });
});
