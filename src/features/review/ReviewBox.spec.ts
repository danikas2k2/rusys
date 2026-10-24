import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.use({ scenario: 'review' });

test.describe('review', () => {
    test('keeps the filter header in place across short and long categories', async ({ page, db }) => {
        await page.setViewportSize({ width: 390, height: 700 });
        await db.collection<Product>('products').insertMany(
            ['Uogienės', 'Daržovės'].flatMap((group) =>
                Array.from({ length: group === 'Uogienės' ? 2 : 35 }, (_, index) => ({
                    group,
                    name: `${group} ${index}`,
                    years: [{ year: currentYear, amounts: [] }],
                }))
            )
        );
        await page.goto('/');
        await page.getByRole('button', { name: 'Peržiūra' }).click();
        const review = page.getByRole('dialog').last();
        await expect(review.getByRole('row', { name: /Uogienės 0/ })).toBeVisible();
        const header = review.locator('.ui-Modal-header');
        const filter = review.locator('.ReviewBox-filter');
        const closeButton = review.getByRole('button', { name: 'Uždaryti' });
        const scroll = review.locator('.ReviewBox-scroll');
        const shortHeader = await header.boundingBox();
        const shortFilter = await filter.boundingBox();
        const shortCloseButton = await closeButton.boundingBox();
        const shortScroll = await scroll.evaluate((element) => element.scrollHeight - element.clientHeight);
        expect(shortScroll).toBe(0);

        await review.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(review.getByRole('row', { name: /Daržovės 0/ })).toBeVisible();
        await expect
            .poll(() => scroll.evaluate((element) => element.scrollHeight - element.clientHeight))
            .toBeGreaterThan(0);
        const longHeader = await header.boundingBox();
        const longFilter = await filter.boundingBox();
        const longCloseButton = await closeButton.boundingBox();
        expect(longHeader?.y).toBe(shortHeader?.y);
        expect(longHeader?.height).toBe(shortHeader?.height);
        expect(longFilter?.y).toBe(shortFilter?.y);
        expect(longCloseButton?.y).toBe(shortCloseButton?.y);
    });

    test('clips the category transition inside the scrolled review dialog', async ({ page, db }) => {
        await page.setViewportSize({ width: 390, height: 700 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await db.collection<Product>('products').insertMany(
            ['Uogienės', 'Daržovės'].flatMap((group) =>
                Array.from({ length: 35 }, (_, index) => ({
                    group,
                    name: `${group} ${index}`,
                    years: [{ year: currentYear, amounts: [] }],
                }))
            )
        );
        await page.goto('/');
        await page.getByRole('button', { name: 'Peržiūra' }).click();
        const review = page.getByRole('dialog').last();
        await expect(review.getByRole('row', { name: /Uogienės 0/ })).toBeVisible();
        await expect(review.getByRole('heading', { name: 'Uogienės', level: 1 })).toHaveCount(1);
        await expect(review.locator('[data-category-heading]')).toHaveCount(0);
        await page.waitForTimeout(250);

        const scroll = review.locator('.ReviewBox-scroll');
        await scroll.evaluate((element) => {
            element.scrollTop = 250;
        });
        await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        await expect(review.getByRole('heading', { name: 'Uogienės', level: 1 })).toBeVisible();
        const content = review.locator('.CategoryRailLayout-content');
        await content.evaluate((element) => {
            const animate = element.animate.bind(element);
            element.animate = (keyframes, options) =>
                animate(keyframes, { ...(options as KeyframeAnimationOptions), duration: 2000 });
        });
        const closeButtonClip = { x: 320, y: 0, width: 70, height: 48 };
        const closeButtonBefore = await page.screenshot({ clip: closeButtonClip });

        await review.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(review.getByRole('row', { name: /Daržovės 0/ })).toBeVisible();
        await expect(review.getByRole('heading', { name: 'Daržovės', level: 1 })).toHaveCount(1);
        await expect.poll(() => content.evaluate((element) => element.getAnimations().length)).toBeGreaterThan(0);
        await page.waitForTimeout(300);
        expect(await page.screenshot({ clip: closeButtonClip })).toEqual(closeButtonBefore);
    });

    test('review tooltip and untouched selection', async ({ page, db }) => {
        await page.goto('/');
        await test.step('review button shows its tooltip to the left', async () => {
            const button = page.getByRole('button', { name: 'Peržiūra' });
            const tooltip = page.getByRole('tooltip', { name: 'Peržiūra' });
            await expect(async () => {
                await page.mouse.move(0, 0);
                await button.hover();
                await expect(tooltip).toBeVisible({ timeout: 1000 });
            }).toPass({ timeout: 10_000 });
            await expect
                .poll(async () => {
                    const buttonBounds = (await button.boundingBox())!;
                    const tooltipBounds = (await tooltip.boundingBox())!;
                    return tooltipBounds.x + tooltipBounds.width - buttonBounds.x;
                })
                .toBeLessThanOrEqual(0);
        });

        await test.step('select-all can return a category to untouched without saving changes', async () => {
            await page.getByRole('button', { name: 'Peržiūra' }).click();
            const review = page.getByRole('dialog').last();
            const master = review.getByRole('row', { name: 'Uogienės' }).getByRole('checkbox');
            await master.click();
            await expect(master).toHaveAttribute('data-untouched', 'false');
            await master.click();
            await expect(master).toBeChecked();
            await master.click();
            await expect(master).toHaveAttribute('data-untouched', 'true');
            await review.getByRole('button', { name: 'Taikyti' }).click();
            expect((await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing).toBe(true);
        });
    });

    test('review changes only the touched category and persists missing status @critical', async ({ page, db }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Peržiūra' }).click();
        const review = page.getByRole('dialog').last();
        await review.getByRole('row', { name: 'Avietės' }).getByRole('checkbox').check();
        await review.getByRole('button', { name: 'Taikyti' }).click();
        await expect(review).toHaveCount(0);
        await expect(
            productTile(page, 'Avietės').getByRole('checkbox', { name: 'Pažymėti kaip trūkstamą' })
        ).toBeChecked();
        await page.reload();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing)
            .toBeFalsy();
        expect((await db.collection<Product>('products').findOne({ name: 'Morkos' }))?.missing).toBeUndefined();
    });

    test('missing-only filter reacts to a product checkbox', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.getByRole('checkbox', { name: 'Trūksta 1 produkto' }).click();
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await expect(productTile(page, 'Braškės')).toBeHidden();
        await productTile(page, 'Avietės').getByRole('checkbox', { name: 'Pažymėti kaip turimą' }).click();
        await expect(productTile(page, 'Braškės')).toBeVisible();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing)
            .toBeFalsy();
    });
});
