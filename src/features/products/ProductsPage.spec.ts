import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/common/data';

test.describe('products', () => {
    test('animates the missing-products filter in both directions', async ({ page, db }) => {
        await db.collection<Product>('products').updateOne({ name: 'Avietės' }, { $set: { missing: true } });
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await expect(productTile(page, 'Braškės')).toBeVisible();
        await page.evaluate(() => {
            const original = document.startViewTransition.bind(document);
            const counter = window as typeof window & { __missingViewTransitions: number };
            counter.__missingViewTransitions = 0;
            document.startViewTransition = (...args) => {
                counter.__missingViewTransitions += 1;
                return original(...args);
            };
        });

        const filter = page.locator('[data-products-header]').getByRole('checkbox');
        await filter.click();
        await expect(productTile(page, 'Braškės')).toHaveCount(0);
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __missingViewTransitions: number }).__missingViewTransitions
                )
            )
            .toBeGreaterThan(0);
        const afterEnable = await page.evaluate(
            () => (window as typeof window & { __missingViewTransitions: number }).__missingViewTransitions
        );

        await filter.click();
        await expect(productTile(page, 'Braškės')).toBeVisible();
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __missingViewTransitions: number }).__missingViewTransitions
                )
            )
            .toBeGreaterThan(afterEnable);
    });

    test('animates a product tile when it is added and removed', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.evaluate(() => {
            const original = document.startViewTransition.bind(document);
            const counter = window as typeof window & {
                __tileViewTransitions: number;
                __tileAnimations: string[];
            };
            counter.__tileViewTransitions = 0;
            counter.__tileAnimations = [];
            document.startViewTransition = (...args) => {
                counter.__tileViewTransitions += 1;
                const transition = original(...args);
                void transition.ready.then(
                    () => {
                        counter.__tileAnimations.push(
                            ...document
                                .getAnimations()
                                .filter((animation): animation is CSSAnimation => animation instanceof CSSAnimation)
                                .map((animation) => animation.animationName)
                        );
                    },
                    () => {}
                );
                return transition;
            };
        });

        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await add.getByRole('textbox', { name: 'Produktas' }).fill('Šilauogės');
        await add.getByRole('button', { name: 'Pridėti' }).click();
        await expect(productTile(page, 'Šilauogės')).toBeVisible();
        await expect
            .poll(() =>
                page.evaluate(() => (window as typeof window & { __tileViewTransitions: number }).__tileViewTransitions)
            )
            .toBeGreaterThan(0);
        const afterAdd = await page.evaluate(
            () => (window as typeof window & { __tileViewTransitions: number }).__tileViewTransitions
        );
        await expect
            .poll(() =>
                page.evaluate(() => (window as typeof window & { __tileAnimations: string[] }).__tileAnimations)
            )
            .toContain('product-tile-fade-in');

        const amount = page.getByRole('dialog', { name: /Šilauogės Uogienės/ });
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        const edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit.getByRole('button', { name: 'Šalinti' }).click();
        const confirm = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
        await confirm.getByRole('button', { name: 'Šalinti' }).click();
        await expect(productTile(page, 'Šilauogės')).toHaveCount(0);
        await expect
            .poll(() =>
                page.evaluate(() => (window as typeof window & { __tileViewTransitions: number }).__tileViewTransitions)
            )
            .toBeGreaterThan(afterAdd);
        await expect
            .poll(() =>
                page.evaluate(() => (window as typeof window & { __tileAnimations: string[] }).__tileAnimations)
            )
            .toContain('product-tile-fade-out');
    });

    test('animates the advanced product fields without losing their values', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        const details = add.getByRole('button', { name: 'Papildoma informacija' });
        await page.evaluate(() => {
            const original = document.startViewTransition.bind(document);
            const counter = window as typeof window & { __advancedViewTransitions: number };
            counter.__advancedViewTransitions = 0;
            document.startViewTransition = (...args) => {
                counter.__advancedViewTransitions += 1;
                return original(...args);
            };
        });

        await details.click();
        await expect(details).toHaveAttribute('aria-expanded', 'true');
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __advancedViewTransitions: number }).__advancedViewTransitions
                )
            )
            .toBeGreaterThan(0);
        const expiry = add.getByRole('textbox', { name: 'Galiojimo paklaida' });
        await expiry.fill('7');
        const afterExpand = await page.evaluate(
            () => (window as typeof window & { __advancedViewTransitions: number }).__advancedViewTransitions
        );

        await details.click();
        await expect(details).toHaveAttribute('aria-expanded', 'false');
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __advancedViewTransitions: number }).__advancedViewTransitions
                )
            )
            .toBeGreaterThan(afterExpand);
        await details.click();
        await expect(expiry).toHaveValue('7');
    });

    test('animates a grouped product while expanding and collapsing its children', async ({ page, db }) => {
        await db.collection<Product>('products').insertOne({
            group: 'Uogienės',
            name: 'Aviečių uogienė be cukraus',
            parent: 'Avietės',
            years: [],
        });
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.evaluate(() => {
            const original = document.startViewTransition.bind(document);
            const counter = window as typeof window & { __groupViewTransitions: number };
            counter.__groupViewTransitions = 0;
            document.startViewTransition = (...args) => {
                counter.__groupViewTransitions += 1;
                return original(...args);
            };
        });

        await productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __groupViewTransitions: number }).__groupViewTransitions
                )
            )
            .toBeGreaterThan(0);
        const afterExpand = await page.evaluate(
            () => (window as typeof window & { __groupViewTransitions: number }).__groupViewTransitions
        );

        await productTile(page, 'Avietės').getByRole('button', { name: 'Suskleisti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeHidden();
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __groupViewTransitions: number }).__groupViewTransitions
                )
            )
            .toBeGreaterThan(afterExpand);
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
        const category = edit.getByRole('combobox', { name: 'Kategorija' });
        await expect(async () => {
            await category.click();
            await category.fill('Daržovės');
            await category.press('ArrowDown');
            await category.press('Enter');
            await expect(category).toHaveValue('Daržovės', { timeout: 1000 });
        }).toPass({ timeout: 10000 });
        await edit.getByRole('button', { name: 'Perkelti' }).click();
        await page.reload();
        expect((await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.group).toBe('Daržovės');
        await page.getByRole('tab', { name: 'Daržovės' }).click();
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
        const { width } = (await parentTile.boundingBox())!;
        await parentTile.click({ position: { x: width - 4, y: 4 } });
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeHidden();
        await expect(page.getByRole('dialog', { name: /Avietės Uogienės/ })).not.toBeVisible();
        await parentTile.click({ position: { x: width - 4, y: 4 } });
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();
    });

    test('Escape discards an unsaved product while preserving the database', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
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
