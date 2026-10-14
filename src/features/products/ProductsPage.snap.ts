import { expect, test } from '@tests/fixtures/visual';
import { productTile, waitForImages, waitForTileBackground } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('products page', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(page.locator('input').first()).toHaveCSS('caret-color', 'rgba(0, 0, 0, 0)');
    await expect(page).toHaveScreenshot(['ProductsPage', 'products-page.png']);
});

test.describe('scrolled products', () => {
    test.use({ scenario: 'scrolled-products', reducedMotion: 'no-preference' });

    test('sticky filter during a category transition', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 700 });
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.waitForTimeout(250);

        const viewport = page.locator('.ui-AppShell-main [data-scrollarea-viewport]');
        await viewport.evaluate((element) => {
            element.scrollTop = 250;
        });
        await expect.poll(async () => (await page.locator('[data-category-heading]').boundingBox())?.y).toBeLessThan(0);

        const header = await page.locator('[data-products-header]').boundingBox();
        expect(header).not.toBeNull();
        const headerClip = {
            x: Math.ceil(header!.x),
            y: Math.ceil(header!.y),
            width: Math.floor(header!.width),
            height: Math.min(24, Math.floor(header!.height)),
        };
        const screenshot = () => page.screenshot({ clip: headerClip, scale: 'css', caret: 'initial' });
        const snapshot = ['ProductsPage', 'products-scrolled-header.png'];
        expect(await screenshot()).toMatchSnapshot(snapshot);

        await page.addStyleTag({
            content:
                '::view-transition-old(.category-update), ::view-transition-new(.category-update) { animation-duration: 2s !important; }',
        });
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(productTile(page, 'Morkos')).toBeVisible();
        await page.waitForTimeout(300);
        expect(await screenshot()).toMatchSnapshot(snapshot);
    });
});

test.describe('review', () => {
    test.use({ scenario: 'review' });

    test('products page with missing items', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await expect(page).toHaveScreenshot(['ProductsPage', 'products-page-missing.png']);
    });
});

test.describe('with images', () => {
    test.use({ scenario: 'images' });

    test('products page', async ({ page }) => {
        await page.goto('/');
        await waitForImages(page.locator('[data-tabs="category-rail"]'), 2);
        await waitForTileBackground(productTile(page, 'Avietės'));
        await waitForTileBackground(productTile(page, 'Braškės'));
        await expect(page).toHaveScreenshot(['ProductsPage', 'products-page-images.png']);
    });
});
