import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Group, Product } from '~/schema';

test.describe('products', () => {
    test('reveals the selected category when filtering changes and restores the selection', async ({ page, db }) => {
        await db
            .collection<Group>('groups')
            .insertMany(Array.from({ length: 40 }, (_, index) => ({ group: `Kategorija ${index}`, order: index + 2 })));
        await db.collection<Product>('products').insertOne({
            group: 'Kategorija 39',
            name: 'Ieškomas produktas',
            years: [],
        });
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        const rail = page.locator('[data-tabs="category-rail"]');
        const viewport = page.locator('.ui-AppShell-main [data-scrollarea-viewport]');
        await expect(rail).toHaveCSS('--category-rail-height', /\d+px/);
        const search = page.getByRole('searchbox', { name: 'filtruokite' });
        await search.fill('Ieškomas');
        const lastCategory = rail.getByRole('tab', { name: 'Kategorija 39', exact: true });
        await expect(lastCategory).toHaveAttribute('aria-selected', 'true');
        await expect.poll(() => rail.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        const railBox = (await rail.boundingBox())!;
        const selectedBox = (await lastCategory.boundingBox())!;
        const clearance = await page.evaluate(() =>
            Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
        );
        expect(selectedBox.y).toBeGreaterThanOrEqual(railBox.y + clearance - 1);
        expect(selectedBox.y + selectedBox.height).toBeLessThanOrEqual(railBox.y + railBox.height - clearance + 1);
        expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);

        await search.fill('');
        const firstCategory = rail.getByRole('tab', { name: 'Uogienės', exact: true });
        await expect(firstCategory).toHaveAttribute('aria-selected', 'true');
        await expect
            .poll(async () => (await firstCategory.boundingBox())!.y)
            .toBeGreaterThanOrEqual(railBox.y + clearance - 1);
        const restoredBox = (await firstCategory.boundingBox())!;
        expect(restoredBox.y + restoredBox.height).toBeLessThanOrEqual(railBox.y + railBox.height + 1);
        expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);
    });

    test('scrolls the category rail independently from product content', async ({
        page,
        db,
        browserName,
        isMobile,
    }) => {
        await db
            .collection<Group>('groups')
            .insertMany(Array.from({ length: 40 }, (_, index) => ({ group: `Kategorija ${index}`, order: index + 2 })));
        await db
            .collection<Product>('products')
            .insertMany(
                Array.from({ length: 100 }, (_, index) => ({ group: 'Uogienės', name: `Uogienė ${index}`, years: [] }))
            );
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        const rail = page.locator('[data-tabs="category-rail"]');
        const viewport = page.locator('.ui-AppShell-main [data-scrollarea-viewport]');
        await expect(rail).toHaveCSS('overscroll-behavior-y', 'contain');
        await expect(rail).toHaveCSS('--category-rail-height', /\d+px/);
        expect(await rail.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
        const initialRailBox = (await rail.boundingBox())!;
        const viewportBox = (await viewport.boundingBox())!;
        expect(initialRailBox.y + initialRailBox.height).toBeLessThanOrEqual(viewportBox.y + viewportBox.height + 1);

        await rail.hover({ position: { x: initialRailBox.width / 2, y: initialRailBox.height / 2 } });
        // Playwright cannot send wheel input to mobile WebKit; exercise its native scrollport directly.
        const supportsWheel = browserName !== 'webkit' || !isMobile;
        if (supportsWheel) {
            await page.mouse.wheel(0, 250);
        } else {
            await rail.evaluate((element) => element.scrollBy(0, 250));
        }
        await expect.poll(() => rail.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);

        await rail.evaluate((element) => {
            element.scrollTop = element.scrollHeight;
        });
        if (supportsWheel) {
            await page.mouse.wheel(0, 400);
        }
        // Cross a rendering boundary so an incorrectly chained wheel has time to reach the parent.
        await page.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        );
        expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);
        const railScrollTop = await rail.evaluate((element) => element.scrollTop);

        const content = page.locator('.CategoryRailLayout-content');
        const contentBox = (await content.boundingBox())!;
        await page.mouse.move(contentBox.x + contentBox.width / 2, viewportBox.y + viewportBox.height / 2);
        if (supportsWheel) {
            await page.mouse.wheel(0, 300);
        } else {
            await viewport.evaluate((element) => element.scrollBy(0, 300));
        }
        await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        expect(await rail.evaluate((element) => element.scrollTop)).toBe(railScrollTop);
        expect((await rail.boundingBox())!.y).toBeCloseTo(initialRailBox.y, 0);
    });

    test('keeps page snapshots behind the product dialog while changing years', async ({ page, db }) => {
        const currentYear = new Date().getFullYear() % 100;
        const previousYear = currentYear - 1;
        await db.collection<Product>('products').updateOne(
            { name: 'Avietės' },
            {
                $set: {
                    years: [
                        { year: currentYear, amounts: [{ variant: 'Stiklainis', amount: 3 }] },
                        { year: previousYear, amounts: [{ variant: 'Stiklainis', amount: 2 }] },
                    ],
                },
            }
        );
        await page.goto('/');
        const viewport = page.locator('.ui-AppShell-main [data-scrollarea-viewport]');
        const header = page.locator('[data-products-header]');
        const supportsClipping = await page.evaluate(() => CSS.supports('view-transition-group', 'contain'));
        if (supportsClipping) {
            await expect(viewport).toHaveCSS('view-transition-name', 'category-page-scrollport');
            await expect(header).toHaveCSS('view-transition-name', 'products-sticky-header');
        }
        const dialog = await openProduct(page, 'Avietės');
        await expect(viewport).toHaveCSS('view-transition-name', 'none');
        await expect(header).toHaveCSS('view-transition-name', 'none');
        const previousOption = dialog.locator('[data-year-option]').filter({ hasText: String(previousYear) });
        await previousOption.click();
        await expect(previousOption).toHaveAttribute('data-current', 'true');
        await expect(viewport).toHaveCSS('view-transition-name', 'none');
        await dialog.getByRole('button', { name: 'Uždaryti' }).click();
        if (supportsClipping) {
            await expect(viewport).toHaveCSS('view-transition-name', 'category-page-scrollport');
            await expect(header).toHaveCSS('view-transition-name', 'products-sticky-header');
        }
    });

    test('clips the category transition to the scrolled product viewport', async ({ page, db }) => {
        await page.setViewportSize({ width: 390, height: 700 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await db
            .collection<Product>('products')
            .insertMany(
                ['Uogienės', 'Daržovės'].flatMap((group) =>
                    Array.from({ length: 30 }, (_, index) => ({ group, name: `${group} ${index}`, years: [] }))
                )
            );
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.waitForTimeout(250);

        const viewport = page.locator('.ui-AppShell-main [data-scrollarea-viewport]');
        await viewport.evaluate((element) => {
            element.scrollTop = 250;
        });
        await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        await expect.poll(async () => (await page.locator('[data-category-heading]').boundingBox())?.y).toBeLessThan(0);
        const supportsClipping = await page.evaluate(() => CSS.supports('view-transition-group', 'contain'));
        if (supportsClipping) {
            expect(
                await viewport.evaluate((element) => ({
                    name: getComputedStyle(element).viewTransitionName,
                    group: getComputedStyle(element).getPropertyValue('view-transition-group'),
                }))
            ).toStrictEqual({ name: 'category-page-scrollport', group: 'contain' });
            expect(
                await page.evaluate(
                    () =>
                        getComputedStyle(document.documentElement, '::view-transition-group(category-page-scrollport)')
                            .overflow
                )
            ).toBe('clip');
        }

        await page.evaluate(() => {
            const startViewTransition = document.startViewTransition.bind(document);
            document.documentElement.dataset.categoryViewTransitions = '0';
            document.documentElement.dataset.categoryFadeAnimations = '0';
            document.startViewTransition = (...args) => {
                document.documentElement.dataset.categoryViewTransitions = String(
                    Number(document.documentElement.dataset.categoryViewTransitions) + 1
                );
                return startViewTransition(...args);
            };
            const content = document.querySelector<HTMLElement>('.CategoryRailLayout-content')!;
            const animate = content.animate.bind(content);
            content.animate = (...args) => {
                document.documentElement.dataset.categoryFadeAnimations = String(
                    Number(document.documentElement.dataset.categoryFadeAnimations) + 1
                );
                return animate(...args);
            };
        });

        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(productTile(page, 'Morkos')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute(
            'data-category-view-transitions',
            supportsClipping ? '1' : '0'
        );
        await expect(page.locator('html')).toHaveAttribute(
            'data-category-fade-animations',
            supportsClipping ? '0' : '1'
        );
    });

    test('filters missing products in both directions', async ({ page, db }) => {
        await db.collection<Product>('products').updateOne({ name: 'Avietės' }, { $set: { missing: true } });
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await expect(productTile(page, 'Braškės')).toBeVisible();
        const filter = page.locator('[data-products-header]').getByRole('checkbox');
        await filter.click();
        await expect(filter).not.toBeChecked();
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await expect(productTile(page, 'Braškės')).toHaveCount(0);

        await filter.click();
        await expect(filter).toBeChecked();
        await expect(productTile(page, 'Braškės')).toBeVisible();
    });

    test('adds and removes a product from the grid', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await add.getByRole('textbox', { name: 'Produktas' }).fill('Šilauogės');
        await add.getByRole('button', { name: 'Pridėti' }).click();
        await expect(productTile(page, 'Šilauogės')).toBeVisible();
        await expect.poll(() => db.collection<Product>('products').countDocuments({ name: 'Šilauogės' })).toBe(1);

        const amount = page.getByRole('dialog', { name: /Šilauogės Uogienės/ });
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        const edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit.getByRole('button', { name: 'Šalinti' }).click();
        const confirm = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
        await confirm.getByRole('button', { name: 'Šalinti' }).click();
        await expect(productTile(page, 'Šilauogės')).toHaveCount(0);
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Šilauogės' }))?.archivedAt)
            .toBeDefined();
    });

    test('preserves advanced product fields when collapsed and reopened', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        const details = add.getByRole('button', { name: 'Papildoma informacija' });
        await details.click();
        await expect(details).toHaveAttribute('aria-expanded', 'true');
        const expiry = add.getByRole('textbox', { name: 'Galiojimo paklaida' });
        await expiry.fill('7');

        await details.click();
        await expect(details).toHaveAttribute('aria-expanded', 'false');
        await details.click();
        await expect(details).toHaveAttribute('aria-expanded', 'true');
        await expect(expiry).toHaveValue('7');
    });

    test('expands and collapses a grouped product', async ({ page, db }) => {
        await db.collection<Product>('products').insertOne({
            group: 'Uogienės',
            name: 'Aviečių uogienė be cukraus',
            parent: 'Avietės',
            years: [],
        });
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();
        await productTile(page, 'Avietės').getByRole('button', { name: 'Suskleisti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeHidden();
    });

    test('product amounts wrap when the tile is narrow', async ({ page }) => {
        await page.goto('/');
        const tile = productTile(page, 'Avietės');
        await expect(tile).toBeVisible();
        const title = tile.locator('[data-product-title]');
        const amounts = tile.locator('[data-tile-amounts]');
        const details = tile.locator('[data-product-details]');
        await expect
            .poll(async () => Math.abs((await amounts.boundingBox())!.y - (await title.boundingBox())!.y))
            .toBeLessThan(2);
        await tile.evaluate((element) => {
            (element as HTMLElement).style.width = '120px';
        });
        await expect
            .poll(
                async () =>
                    (await amounts.boundingBox())!.y >=
                    (await title.boundingBox())!.y + (await title.boundingBox())!.height
            )
            .toBe(true);
        const amountBox = (await amounts.boundingBox())!;
        const detailsBox = (await details.boundingBox())!;
        expect(Math.abs(amountBox.x + amountBox.width - detailsBox.x - detailsBox.width)).toBeLessThan(2);
        expect(await tile.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    });

    test('neighboring product cards share the height of the tallest card', async ({ page, db }) => {
        const longName =
            'Labai ilgas produkto pavadinimas su papildoma informacija, kurios neužtenka sutalpinti vienoje eilutėje';
        await db.collection<Product>('products').updateOne({ name: 'Avietės' }, { $set: { name: longName } });
        await page.goto('/');
        const first = productTile(page, longName);
        const second = productTile(page, 'Braškės');
        await expect(first).toBeVisible();
        await expect(second).toBeVisible();
        await first.evaluate((element) => {
            const grid = element.parentElement!;
            grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
            grid.style.gridTemplateRows = 'auto';
        });
        const firstBox = (await first.boundingBox())!;
        const secondBox = (await second.boundingBox())!;
        expect(firstBox.y).toBe(secondBox.y);
        expect(firstBox.height).toBe(secondBox.height);
        expect((await first.locator('[data-product-name]').boundingBox())!.height).toBeGreaterThan(
            (await second.locator('[data-product-name]').boundingBox())!.height
        );
    });

    test('creates a product and opens its amounts dialog @critical', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await add.getByRole('textbox', { name: 'Produktas' }).fill('Mėlynės');
        await add.getByRole('button', { name: 'Pridėti' }).click();
        await expect(page.getByRole('dialog', { name: /Mėlynės Uogienės/ })).toBeVisible();
        expect((await db.collection<Product>('products').findOne({ name: 'Mėlynės' }))?.group).toBe('Uogienės');
        await page
            .getByRole('dialog', { name: /Mėlynės Uogienės/ })
            .getByRole('button', { name: 'Uždaryti' })
            .click();
        await page.reload();
        await expect(productTile(page, 'Mėlynės')).toBeVisible();
    });

    test('centred product dialog aligns with a simulated keyboard viewport', async ({ page, isMobile }) => {
        test.skip(!isMobile);
        await page.goto('/');
        await page.locator('[data-action="add"]').click();
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(dialog).toBeVisible();
        const before = await dialog.boundingBox();
        expect(before!.y).toBeGreaterThan(0);

        await dialog.evaluate((element) => {
            element.setAttribute('data-keyboard-viewport', '');
            (element as HTMLElement).style.setProperty('--keyboard-viewport-height', '300px');
            element.parentElement!.setAttribute('data-keyboard-viewport', '');
            element.parentElement!.style.setProperty('--keyboard-viewport-top', '0px');
        });

        await expect(dialog).toHaveCSS('height', '300px');
        const after = await dialog.boundingBox();
        expect(after!.y).toBeCloseTo(0, 0);
    });

    test('renames, moves and removes a product with confirmation', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        let edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit.getByRole('textbox', { name: 'Produktas' }).fill('Aviečių džemas');
        await edit.getByRole('button', { name: 'Naujinti' }).click();
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        await page.reload();
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        amount = await openProduct(page, 'Aviečių džemas');
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await expect(edit.getByRole('textbox', { name: 'Produktas' })).toBeFocused();
        const category = edit.getByRole('combobox', { name: 'Kategorija' });
        await category.click();
        const vegetables = page.getByRole('option', { name: 'Daržovės' });
        await expect(vegetables).toBeVisible();
        await vegetables.click();
        await expect(category).toHaveValue('Daržovės');
        await edit.getByRole('button', { name: 'Perkelti' }).click();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.group)
            .toBe('Daržovės');
        await page.reload();
        expect((await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.group).toBe('Daržovės');
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.getByRole('tab', { name: 'Daržovės' })).toHaveAttribute('aria-selected', 'true');
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        await productTile(page, 'Aviečių džemas').click();
        await page
            .getByRole('dialog', { name: /Aviečių džemas Daržovės/ })
            .getByRole('button', { name: 'Taisyti' })
            .click();
        edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit.getByRole('button', { name: 'Šalinti' }).click();
        const confirm = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
        await confirm.getByRole('button', { name: 'Atšaukti' }).click();
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        await edit.getByRole('button', { name: 'Šalinti' }).click();
        await confirm.getByRole('button', { name: 'Šalinti' }).click();
        await expect(productTile(page, 'Aviečių džemas')).toHaveCount(0);
        expect(
            (await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.archivedAt
        ).toBeDefined();
    });

    test('creates a child product and expands its parent tile', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await add.getByRole('textbox', { name: 'Produktas' }).fill('Aviečių uogienė be cukraus');
        await add.getByRole('button', { name: 'Papildoma informacija' }).click();
        const parent = add.getByRole('combobox', { name: 'Tėvinis produktas' });
        await parent.click();
        await parent.fill('Avietės');
        await page.getByRole('option', { name: 'Avietės' }).click();
        await expect(parent).toHaveValue('Avietės');
        await add.getByRole('button', { name: 'Pridėti' }).click();
        await expect(page.getByRole('dialog', { name: /Aviečių uogienė be cukraus Uogienės/ })).toBeVisible();
        expect((await db.collection<Product>('products').findOne({ name: 'Aviečių uogienė be cukraus' }))?.parent).toBe(
            'Avietės'
        );
        await page
            .getByRole('dialog', { name: /Aviečių uogienė be cukraus Uogienės/ })
            .getByRole('button', { name: 'Uždaryti' })
            .click();
        await expect(productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' })).toBeVisible();
        await productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();

        const parentTile = productTile(page, 'Avietės');
        await parentTile.getByRole('button', { name: 'Suskleisti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeHidden();
        await expect(page.getByRole('dialog', { name: /Avietės Uogienės/ })).not.toBeVisible();
        await parentTile.getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();
    });

    test('Escape discards an unsaved product while preserving the database', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(add.getByRole('textbox', { name: 'Produktas' })).toBeFocused();
        await add.getByRole('textbox', { name: 'Produktas' }).fill('Serbentai');
        await page.keyboard.press('Escape');
        await page
            .getByRole('dialog', { name: 'Atmesti neišsaugotus pakeitimus?' })
            .getByRole('button', { name: 'Atmesti' })
            .click();
        await expect(add).toHaveCount(0);
        expect(await db.collection<Product>('products').countDocuments({ name: 'Serbentai' })).toBe(0);
    });
});
