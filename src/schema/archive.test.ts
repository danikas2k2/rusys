import { serializedArchiveDataSchema } from '~/schema/archive';

const emptyArchive = { products: [], groups: [], variants: [] };
const row = { variant: ' jar: ', amount: -1, recycled: false, suspicious: null, home: null, expiresAt: null };
const stockYear = { year: -1, amounts: [row], removing: false };
const historyYear = { year: 0, amounts: [row] };
const update = { time: '2026-09-01T00:00:00Z', years: [historyYear] };

function withProduct(product: Record<string, unknown>) {
    return { ...emptyArchive, products: [{ group: ' A: ', name: '', ...product }] };
}

describe('serializedArchiveDataSchema', () => {
    it.each(['variantImages', 'variantPhotos', 'variantImagesChecked'] as const)(
        'validates and preserves every own key in legacy %s maps',
        (field) => {
            const validValue = field === 'variantImagesChecked' ? true : 'image.webp';
            const invalidValue = field === 'variantImagesChecked' ? 'true' : 5;

            for (const key of ['__proto__', 'constructor', 'prototype']) {
                const validMap: unknown = JSON.parse(JSON.stringify({ [key]: validValue }));
                const data = withProduct({ [field]: validMap });
                const parsed = serializedArchiveDataSchema.parse(data);

                expect(parsed.products[0][field]).toStrictEqual(validMap);
                expect(Object.hasOwn(parsed.products[0][field]!, key)).toBe(true);

                const invalidMap: unknown = JSON.parse(JSON.stringify({ [key]: invalidValue }));

                expect(serializedArchiveDataSchema.safeParse(withProduct({ [field]: invalidMap })).success).toBe(false);
            }
        }
    );

    it.each([null, [], 'image.webp', 5])('rejects non-object image maps: %j', (value) => {
        for (const field of ['variantImages', 'variantPhotos', 'variantImagesChecked']) {
            expect(serializedArchiveDataSchema.safeParse(withProduct({ [field]: value })).success).toBe(false);
        }
    });

    it('preserves legacy fields while converting product update times', () => {
        const data = {
            products: [
                {
                    group: ' A: ',
                    name: '',
                    parent: '',
                    years: [stockYear, { year: 0 }, { year: 1, amounts: null }],
                    updates: [update, { time: -1, years: null, user: '', comment: '' }],
                    undates: [{ time: '2026-09-01T00:00:00Z', years: [] }],
                    missing: false,
                    image: '',
                    photo: '',
                    variantImages: { arbitrary: '' },
                    variantPhotos: { arbitrary: '' },
                    imageChecked: false,
                    variantImagesChecked: { arbitrary: true },
                    archivedAt: -1,
                },
                { group: '', name: ' ', years: null, updates: null, undates: null },
            ],
            groups: [{ group: '', order: -1, annual: false, review: true, image: '', photo: '', archivedAt: -1 }],
            variants: [
                { group: '', variant: '', order: -1, suffix: '', count: -0.5, units: 'legacy-unit', archivedAt: 0 },
            ],
        };

        expect(serializedArchiveDataSchema.parse(data)).toStrictEqual({
            ...data,
            products: [
                {
                    ...data.products[0],
                    updates: [
                        { ...update, time: Date.parse(update.time) },
                        { time: -1, years: null, user: '', comment: '' },
                    ],
                },
                { ...data.products[1], updates: undefined },
            ],
        });
        expect(serializedArchiveDataSchema.parse(emptyArchive)).toStrictEqual(emptyArchive);
    });

    it('converts ISO and numeric update times without mutating input or converting undo entries', () => {
        const data = withProduct({
            updates: [
                { time: '2026-09-01T00:00:00Z', years: null },
                { time: 123, years: [] },
                { time: '2026-99-99T99:99:99Z', years: null },
            ],
            undates: [{ time: '2026-08-01T00:00:00Z', years: null }],
        });
        const original = structuredClone(data);
        const parsed = serializedArchiveDataSchema.parse(data);

        expect(parsed.products[0].updates).toStrictEqual([
            { time: Date.parse('2026-09-01T00:00:00Z'), years: null },
            { time: 123, years: [] },
            { time: NaN, years: null },
        ]);
        expect(parsed.products[0].undates).toStrictEqual([{ time: '2026-08-01T00:00:00Z', years: null }]);
        expect(data).toStrictEqual(original);
    });

    it.each([
        [{}, undefined],
        [{ updates: null }, undefined],
        [{ updates: [] }, []],
        [{ updates: undefined }, undefined],
    ])('returns the prior importer update shape for %j', (fields, expected) => {
        const parsed = serializedArchiveDataSchema.parse(withProduct(fields));

        expect(Object.hasOwn(parsed.products[0], 'updates')).toBe(true);
        expect(parsed.products[0].updates).toStrictEqual(expected);
    });

    it.each([
        { ...emptyArchive, unknown: true },
        withProduct({ unknown: true }),
        { ...emptyArchive, groups: [{ group: 'A', order: 0, unknown: true }] },
        { ...emptyArchive, variants: [{ group: 'A', variant: 'v', order: 0, unknown: true }] },
        withProduct({ years: [{ ...stockYear, unknown: true }] }),
        withProduct({ years: [{ year: 0, amounts: [{ ...row, unknown: true }] }] }),
        withProduct({ updates: [{ ...update, unknown: true }] }),
        withProduct({ updates: [{ ...update, years: [{ ...historyYear, removing: true }] }] }),
        withProduct({ updates: [{ ...update, years: [{ year: 0, amounts: [{ ...row, unknown: true }] }] }] }),
        withProduct({ undates: [{ ...update, unknown: true }] }),
    ])('rejects undeclared fields at every fixed-shape object level: %j', (data) => {
        expect(serializedArchiveDataSchema.safeParse(data).success).toBe(false);
    });

    it.each([
        null,
        {},
        { products: [], groups: [] },
        { ...emptyArchive, products: null },
        { ...emptyArchive, groups: null },
        { ...emptyArchive, variants: null },
        { ...emptyArchive, products: [{ name: 'P' }] },
        withProduct({ updates: [{ time: 0 }] }),
        withProduct({ undates: [{ years: null }] }),
        withProduct({ years: [{}] }),
        withProduct({ years: [{ year: 0, amounts: [{ variant: 'v' }] }] }),
        withProduct({ years: [{ year: 0, amounts: [{ amount: 1 }] }] }),
    ])('requires the original root and nested fields: %j', (data) => {
        expect(serializedArchiveDataSchema.safeParse(data).success).toBe(false);
    });

    it.each([undefined, null, []])('accepts optional/nullable stock and history arrays: %j', (value) => {
        expect(
            serializedArchiveDataSchema.safeParse(withProduct({ years: value, updates: value, undates: value })).success
        ).toBe(true);
        expect(
            serializedArchiveDataSchema.safeParse(withProduct({ updates: [{ time: 0, years: value }] })).success
        ).toBe(value !== undefined);
        expect(
            serializedArchiveDataSchema.safeParse(withProduct({ years: [{ year: 0, amounts: value }] })).success
        ).toBe(true);
    });

    it.each([
        withProduct({ years: [{ year: 0.5 }] }),
        withProduct({ years: [{ year: 0, amounts: [{ variant: 'v', amount: 0.5 }] }] }),
        withProduct({ years: [{ year: 0, amounts: [{ ...row, expiresAt: 0.5 }] }] }),
        withProduct({ archivedAt: 0.5 }),
        withProduct({ updates: [{ time: 0.5, years: null }] }),
        { ...emptyArchive, groups: [{ group: 'A', order: 0.5 }] },
        { ...emptyArchive, groups: [{ group: 'A', order: 0, archivedAt: 0.5 }] },
        { ...emptyArchive, variants: [{ group: 'A', variant: 'v', order: 0.5 }] },
        { ...emptyArchive, variants: [{ group: 'A', variant: 'v', order: 0, archivedAt: 0.5 }] },
        { ...emptyArchive, variants: [{ group: 'A', variant: 'v', order: 0, count: Infinity }] },
        withProduct({ updates: [{ time: Infinity, years: null }] }),
        withProduct({ years: [{ year: '2026' }] }),
    ])('retains integer/finite numeric constraints without coercion: %j', (data) => {
        expect(serializedArchiveDataSchema.safeParse(data).success).toBe(false);
    });

    it.each([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1, 1e100])(
        'accepts legacy integers beyond the safe range: %s',
        (value) => {
            const data = {
                products: [
                    {
                        group: '',
                        name: '',
                        archivedAt: value,
                        updates: [
                            {
                                time: value,
                                years: [{ year: value, amounts: [{ variant: '', amount: value, expiresAt: value }] }],
                            },
                        ],
                    },
                ],
                groups: [{ group: '', order: value, archivedAt: value }],
                variants: [{ group: '', variant: '', order: value, archivedAt: value }],
            };

            expect(serializedArchiveDataSchema.safeParse(data).success).toBe(true);
        }
    );

    it.each([
        '2026-09-01T00:00:00Z',
        '2026-09-01T00:00:00.123+02:00',
        '2026-09-01T00:00:00-05:30',
        '2026-99-99T99:99:99Z',
    ])('preserves the ISO-shaped timestamp acceptance rule: %s', (time) => {
        expect(serializedArchiveDataSchema.safeParse(withProduct({ updates: [{ time, years: null }] })).success).toBe(
            true
        );
    });

    it.each(['2026-09-01', '2026-09-01T00:00:00', '2026-09-01t00:00:00z', '2026-09-01T00:00Z', 'yesterday'])(
        'rejects timestamps outside the legacy ISO regex: %s',
        (time) => {
            expect(
                serializedArchiveDataSchema.safeParse(withProduct({ undates: [{ time, years: null }] })).success
            ).toBe(false);
        }
    );

    it.each([
        withProduct({ parent: null }),
        withProduct({ missing: null }),
        withProduct({ imageChecked: 'true' }),
        withProduct({ variantImages: { v: 1 } }),
        withProduct({ variantPhotos: { v: null } }),
        withProduct({ variantImagesChecked: { v: 1 } }),
        withProduct({ years: [{ year: 0, amounts: [{ ...row, recycled: null }] }] }),
        withProduct({ years: [{ year: 0, amounts: [{ ...row, home: 1 }] }] }),
        withProduct({ expiryToleranceDays: 0 }),
        { ...emptyArchive, variants: [{ group: '', variant: '', order: 0, used: true }] },
    ])('rejects invalid legacy flags/maps and modern-only fields: %j', (data) => {
        expect(serializedArchiveDataSchema.safeParse(data).success).toBe(false);
    });
});
