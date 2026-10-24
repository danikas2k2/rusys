import { SchemaError } from '~/schema/errors';
import {
    addProductSchema,
    setAmountsSchema,
    setProductExpiryToleranceSchema,
    setProductParentSchema,
    transferAmountsSchema,
    updateProductSchema,
} from '~/schema/products';

describe('product form and operation schemas', () => {
    it('shares trimmed domain identity rules between forms and requests', () => {
        const form = updateProductSchema.parse({
            group: ' A ',
            name: ' Pear ',
            parent: '',
            image: '',
            expiryTolerance: '2 sav',
        });

        expect(form).toMatchObject({ group: 'A', name: 'Pear', expiryTolerance: '2 sav' });
        expect(addProductSchema.parse({ group: ' A ', name: ' Pear ' })).toStrictEqual({ group: 'A', name: 'Pear' });
    });

    it('keeps human expiry input in the form and whole days in server requests', () => {
        expect(
            updateProductSchema.safeParse({
                group: 'A',
                name: 'P',
                parent: '',
                image: '',
                expiryTolerance: '1.5 weeks',
            }).success
        ).toBe(false);
        expect(setProductExpiryToleranceSchema.parse({ group: 'A', name: 'P', days: 14 }).days).toBe(14);

        for (const days of ['14', 1.5, -1, Infinity]) {
            expect(setProductExpiryToleranceSchema.safeParse({ group: 'A', name: 'P', days }).success).toBe(false);
        }
    });

    it('allows clearing the parent with undefined but rejects malformed parent names', () => {
        expect(setProductParentSchema.parse({ group: 'A', name: 'P', parent: undefined }).parent).toBeUndefined();
        expect(setProductParentSchema.safeParse({ group: 'A', name: 'P', parent: 'bad:name' }).success).toBe(false);
    });

    it('allows negative stock corrections but requires positive transfers', () => {
        const request = { group: 'A', name: 'P', year: 0, amounts: [{ variant: 'v', amount: -0.5 }] };

        expect(setAmountsSchema.parse(request).amounts[0].amount).toBe(-0.5);
        expect(transferAmountsSchema.safeParse({ ...request, targetGroup: 'B', targetName: 'Q' }).success).toBe(false);
    });

    it('returns stable domain errors for invalid primitive fields', () => {
        const result = addProductSchema.safeParse({ group: 1, name: 2 });

        expect(result.success).toBe(false);

        expect(result.error?.issues.map(({ message }) => message)).toStrictEqual([
            SchemaError.CategoryInvalid,
            SchemaError.ProductNameInvalid,
        ]);
    });

    it('rejects unknown fields inside stock rows as well as the request', () => {
        expect(
            setAmountsSchema.safeParse({
                group: 'A',
                name: 'P',
                year: 0,
                amounts: [{ variant: 'v', amount: 1, user: 'spoofed' }],
            }).success
        ).toBe(false);
    });
});
