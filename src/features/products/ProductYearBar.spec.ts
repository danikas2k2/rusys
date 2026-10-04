import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/common/data';

test.use({ scenario: 'annual' });

test.describe('annual products', () => {
    test('switches annual content and persists the removal marker', async ({ page, db }) => {
        await page.goto('/');
        const amount = await openProduct(page, 'Avietės');
        await test.step('animates the year content when switching between years', async () => {
            await page.evaluate(() => {
                const original = document.startViewTransition.bind(document);
                const counter = window as typeof window & { __yearViewTransitions: number; __yearAnimations: string[] };
                counter.__yearViewTransitions = 0;
                counter.__yearAnimations = [];
                document.startViewTransition = (...args) => {
                    counter.__yearViewTransitions += 1;
                    const transition = original(...args);
                    void transition.ready.then(
                        () => {
                            counter.__yearAnimations.push(
                                ...document
                                    .getAnimations()
                                    .filter((animation): animation is CSSAnimation => animation instanceof CSSAnimation)
                                    .map(
                                        (animation) =>
                                            `${(animation.effect as KeyframeEffect | null)?.pseudoElement}:${animation.animationName}`
                                    )
                            );
                        },
                        () => {}
                    );
                    return transition;
                };
            });

            await amount
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __yearViewTransitions: number }).__yearViewTransitions
                    )
                )
                .toBeGreaterThan(0);
            await expect
                .poll(() =>
                    page.evaluate(() =>
                        (window as typeof window & { __yearAnimations: string[] }).__yearAnimations.some((animation) =>
                            animation.endsWith(':product-year-fade-out')
                        )
                    )
                )
                .toBe(true);
            const afterFirstYear = await page.evaluate(
                () => (window as typeof window & { __yearViewTransitions: number }).__yearViewTransitions
            );

            await amount
                .locator('label')
                .filter({ hasText: String(currentYear - 1) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('2');
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __yearViewTransitions: number }).__yearViewTransitions
                    )
                )
                .toBeGreaterThan(afterFirstYear);
        });

        await test.step('annual years remain separate and removal marker persists', async () => {
            await expect(amount.getByRole('radio', { name: String(currentYear - 1) })).toBeChecked();
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await amount.getByRole('button', { name: 'Šie metai naikinami?' }).click();
            await expect(productTile(page, 'Avietės')).toHaveAttribute('data-removing', 'true');
            await expect
                .poll(async () => {
                    const item = await db.collection<Product>('products').findOne({ name: 'Avietės' });
                    return item?.years?.find(({ year }) => year === currentYear)?.removing;
                })
                .toBe(true);
            await page.reload();
            const product = await db.collection<Product>('products').findOne({ name: 'Avietės' });
            expect(product?.years?.find(({ year }) => year === currentYear)?.removing).toBe(true);
            expect(product?.years?.find(({ year }) => year === currentYear - 1)?.amounts?.[0]?.amount).toBe(2);
        });
    });
});
