import { SchemaError } from '~/schema/errors';
import {
    addProduct,
    movableProduct,
    setAmounts,
    setProductExpiryTolerance,
    setProductParent,
    transferAmounts,
    uniqueProduct,
    updateProduct,
} from '~/schema/products';

describe('product form and operation schemas', () => {
    it('shares trimmed domain identity rules between forms and requests', () => {
        const form = updateProduct.parse({
            group: ' A ',
            name: ' Pear ',
            parent: '',
            image: '',
            expiryTolerance: '2 sav',
        });

        expect(form).toMatchObject({ group: 'A', name: 'Pear', expiryTolerance: '2 sav' });
        expect(addProduct.parse({ group: ' A ', name: ' Pear ' })).toStrictEqual({ group: 'A', name: 'Pear' });
    });

    it('keeps human expiry input in the form and whole days in server requests', () => {
        expect(
            updateProduct.safeParse({
                group: 'A',
                name: 'P',
                parent: '',
                image: '',
                expiryTolerance: '1.5 weeks',
            }).success
        ).toBe(false);
        expect(setProductExpiryTolerance.parse({ group: 'A', name: 'P', days: 14 }).days).toBe(14);

        for (const days of ['14', 1.5, -1, Infinity]) {
            expect(setProductExpiryTolerance.safeParse({ group: 'A', name: 'P', days }).success).toBe(false);
        }
    });

    it('allows clearing the parent with undefined but rejects malformed parent names', () => {
        expect(setProductParent.parse({ group: 'A', name: 'P', parent: undefined }).parent).toBeUndefined();
        expect(setProductParent.safeParse({ group: 'A', name: 'P', parent: 'bad:name' }).success).toBe(false);
    });

    it('allows negative stock corrections but requires positive transfers', () => {
        const request = { group: 'A', name: 'P', year: 0, amounts: [{ variant: 'v', amount: -0.5 }] };

        expect(setAmounts.parse(request).amounts[0].amount).toBe(-0.5);
        expect(transferAmounts.safeParse({ ...request, targetGroup: 'B', targetName: 'Q' }).success).toBe(false);
    });

    it('returns stable domain errors for invalid primitive fields', () => {
        const result = addProduct.safeParse({ group: 1, name: 2 });

        expect(result.success).toBe(false);

        expect(result.error?.issues.map(({ message }) => message)).toStrictEqual([
            SchemaError.CategoryInvalid,
            SchemaError.ProductNameInvalid,
        ]);
    });

    it('rejects unknown fields inside stock rows as well as the request', () => {
        expect(
            setAmounts.safeParse({
                group: 'A',
                name: 'P',
                year: 0,
                amounts: [{ variant: 'v', amount: 1, user: 'spoofed' }],
            }).success
        ).toBe(false);
    });
});

describe('product state-dependent refinements', () => {
    const products = [
        { group: 'A', name: 'Pear' },
        { group: 'A', name: 'Apple', parent: 'Pear' },
    ];

    it('accepts an unchanged product, rejects category-local duplicates, and permits another category', () => {
        const [isUnique] = uniqueProduct('A', 'Pear', products);

        expect(isUnique({ group: 'A', name: 'Pear' })).toBe(true);
        expect(isUnique({ group: 'a', name: 'APPLE' })).toBe(false);
        expect(isUnique({ group: 'B', name: 'Apple' })).toBe(true);

        const [newIsUnique] = uniqueProduct('', '', products);

        expect(newIsUnique({ group: 'a', name: 'PEAR' })).toBe(false);
    });

    it('allows same-category edits but prevents moving a parent with children', () => {
        const [canMove] = movableProduct('A', 'Pear', products);

        expect(canMove({ group: 'A' })).toBe(true);
        expect(canMove({ group: 'B' })).toBe(false);

        const [canMoveLeaf] = movableProduct('A', 'Apple', products);

        expect(canMoveLeaf({ group: 'B' })).toBe(true);
    });
});
