import { css, productTile } from '@tests/browser/visual';
import { expect, test } from 'vitest';

test('CSS locators retain identity when text and matching ancestor counts change', async () => {
    const fixture = document.createElement('section');
    fixture.innerHTML = '<div><button data-locator-target>Initial</button></div>';
    document.body.append(fixture);
    try {
        const target = fixture.querySelector<HTMLButtonElement>('button')!;
        const locator = css('[data-locator-target]');
        const wrapper = document.createElement('div');
        target.replaceWith(wrapper);
        wrapper.append(target);
        target.textContent = 'Updated';
        let clicks = 0;
        target.addEventListener('click', () => clicks++);
        await locator.click();

        expect(locator.element()).toBe(target);
        expect(clicks).toBe(1);
    } finally {
        fixture.remove();
    }
});

test('product locators match the full title and survive quantity updates', () => {
    const fixture = document.createElement('section');
    fixture.innerHTML = `
        <div data-tile-kind="product"><span data-product-name>Avietės su medumi</span></div>
        <div data-tile-kind="product"><span data-product-name>Avietės</span><span data-quantity>3</span></div>
    `;
    document.body.append(fixture);
    try {
        const locator = productTile('Avietės');
        const tile = fixture.lastElementChild!;
        tile.querySelector('[data-quantity]')!.textContent = '12';

        expect(locator.element()).toBe(tile);
    } finally {
        fixture.remove();
    }
});

test('scoped CSS locators stay distinct even when attributes and text are identical', async () => {
    const fixture = document.createElement('section');
    fixture.innerHTML = `
        <div data-locator-parent="first"><button title="Same">Same</button></div>
        <div data-locator-parent="second"><button title="Same">Same</button></div>
    `;
    document.body.append(fixture);
    try {
        const parent = css('[data-locator-parent="second"]');
        const target = css('button', parent);
        const sameTarget = css('button', parent);
        let clicks = 0;
        fixture.lastElementChild!.addEventListener('click', () => clicks++);
        await target.click();

        expect(target.element()).toBe(sameTarget.element());
        expect(clicks).toBe(1);
    } finally {
        fixture.remove();
    }
});
