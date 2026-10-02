import { expect, test } from '@tests/fixtures/test';

test.use({ scenario: 'review' });
test.skip(({ isMobile }) => !isMobile);

test('review controls stay inside the iOS safe area', async ({ page }) => {
    await page.goto('/');
    await page.addStyleTag({
        content:
            ':root { --safe-block-start: 59px; --safe-block-end: 34px; --safe-inline-start: 12px; --safe-inline-end: 12px; }',
    });
    await page.getByRole('button', { name: 'Peržiūra' }).click();

    const dialog = page.getByRole('dialog').last();
    const scroll = dialog.locator('.ReviewBox-scroll');
    const closeButton = dialog.getByRole('button', { name: 'Uždaryti' });
    const actions = dialog.locator('.ReviewBox-actions');
    const applyButton = actions.getByRole('button', { name: 'Taikyti' });
    const viewport = page.viewportSize()!;

    await expect(actions).toHaveCSS('padding-bottom', '50px');
    await expect(scroll).toHaveCSS('padding-left', '12px');
    await expect(scroll).toHaveCSS('padding-right', '12px');
    await expect.poll(async () => (await closeButton.boundingBox())!.y).toBeGreaterThanOrEqual(59);
    await expect
        .poll(async () => {
            const bounds = (await applyButton.boundingBox())!;
            return bounds.y + bounds.height;
        })
        .toBeLessThanOrEqual(viewport.height - 34);
    const applyBounds = (await applyButton.boundingBox())!;
    expect(applyBounds.x + applyBounds.width).toBeLessThanOrEqual(viewport.width - 12);
});
