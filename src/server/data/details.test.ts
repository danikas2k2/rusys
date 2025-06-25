/** @jest-environment node */
import { bulk } from '@tests/bulk';
import { getDetailsFixture } from '@tests/fixtures';
import {
    addDetails,
    addVariantAmount,
    deleteDetails,
    deleteDetailsGroup,
    deleteDetailsVariant,
    getDetails,
    getDetailsVariants,
    moveDetails,
    renameDetails,
    renameDetailsGroup,
    renameDetailsVariant,
    setMissing,
    setRemoving,
    updateDetails,
} from '~/server/data/details';
import { $all } from '~/server/data/tests/utils';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');
jest.mock('~/server/data/groups');
jest.mock('~/server/data/variants');

describe('details', () => {
    const details = getDetailsFixture();

    beforeEach(async () => {
        await (await db()).collection('details').insertMany(details, { forceServerObjectId: true });
    });

    afterEach(async () => {
        await (await db()).collection('details').deleteMany({});
    });

    describe('getDetails', () => {
        it('returns details for specified years', async () => {
            await expect(getDetails([21, 22])).resolves.toStrictEqual([
                { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                { group: 'Uogienės', name: 'Avietės', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                    missing: true,
                },
            ]);
        });

        it('returns details for different years', async () => {
            await expect(getDetails([20, 21])).resolves.toStrictEqual([
                {
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                },
                { group: 'Uogienės', name: 'Avietės', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
            ]);
        });

        it.each`
            title              | years
            ${'invalid years'} | ${[23, 24]}
            ${'empty years'}   | ${[]}
        `('returns no details for $title', async ({ years }) => {
            await expect(getDetails(years)).resolves.toStrictEqual([]);
        });
    });

    describe('getDetailsVariants', () => {
        it('returns details variants', async () => {
            await expect(getDetailsVariants('Uogienės', 'Braškės')).resolves.toIncludeSameMembers(['p', 'm']);
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Braškės'}
            ${'invalid name'}  | ${'Uogienės'} | ${'Bruknės'}
            ${'empty group'}   | ${''}         | ${'Braškės'}
            ${'empty name'}    | ${'Uogienės'} | ${''}
        `('returns no variants for $title', async ({ group, name }) => {
            await expect(getDetailsVariants(group, name)).resolves.toBeUndefined();
        });
    });

    const time = expect.any(Number);

    describe('addDetails', () => {
        it('adds details for new group and specified name', async () => {
            await expect(addDetails('Šaldyti', 'Cukai')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual([...details, { group: 'Šaldyti', name: 'Cukai' }]);
        });

        it.each`
            title            | group         | name
            ${'empty group'} | ${''}         | ${'Braškės'}
            ${'empty name'}  | ${'Uogienės'} | ${''}
        `('does not add details for $title', async ({ group, name }) => {
            await expect(addDetails(group, name)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('updateDetails', () => {
        const amounts = [
            { variant: 'p', amount: 1 },
            { variant: 'm', amount: 2 },
            { variant: 'd', amount: -1, recycled: true },
        ];

        it('updates details for existing group, name, and year', async () => {
            await expect(updateDetails('Daržovės', 'Agurkai', 22, amounts)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: {
                        '2.years.0.amounts': [
                            { variant: 'p', amount: 1 },
                            { variant: 'm', amount: 2 },
                        ],
                    },
                    $push: { '2.updates': { time, years: [{ year: 22, amounts }] } },
                })
            );
        });

        it('updates details for existing group, name, and year but with different variant', async () => {
            const amount = { variant: 'x', amount: 1 };

            await expect(updateDetails('Daržovės', 'Agurkai', 22, [amount])).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '2.years.0.amounts': [{ variant: 'd', amount: 1 }, amount] },
                    $push: { '2.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('does not update details if no updates made', async () => {
            const bruknes = { group: 'Uogienės', name: 'Bruknės', years: [{ year: 21, amounts: [] }] };
            await (await db()).collection('details').insertOne(bruknes, { forceServerObjectId: true });

            await expect(updateDetails('Uogienės', 'Bruknės', 21, [{ variant: 'p', amount: 0 }])).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual([...details, bruknes]);
        });

        const change = { variant: 'p', amount: 1 };

        it.each`
            title                  | group         | name         | year  | changes
            ${'invalid name'}      | ${'Uogienės'} | ${'Bruknės'} | ${22} | ${[change]}
            ${'invalid group'}     | ${'Šaldyti'}  | ${'Agurkai'} | ${22} | ${[change]}
            ${'empty group'}       | ${''}         | ${'Agurkai'} | ${22} | ${[change]}
            ${'empty name'}        | ${'Daržovės'} | ${''}        | ${22} | ${[change]}
            ${'empty year'}        | ${'Daržovės'} | ${'Agurkai'} | ${0}  | ${[change]}
            ${'empty changes'}     | ${'Uogienės'} | ${'Avietės'} | ${22} | ${[]}
            ${'undefined changes'} | ${'Uogienės'} | ${'Avietės'} | ${22} | ${undefined}
        `('does not update details for $title', async ({ group, name, year, changes }) => {
            await expect(updateDetails(group, name, year, changes)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });

        it('removes missing flag when missing and negative update received', async () => {
            const amount = { variant: 'p', amount: -1 };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $unset: ['1.missing'],
                    $set: { '1.years.0.amounts.0.amount': 1 },
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('does not remove missing flag when missing and positive update received', async () => {
            const amount = { variant: 'p', amount: 1 };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '1.years.0.amounts.0.amount': 3 },
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('does not remove missing flag when missing and recycled update received', async () => {
            const amount = { variant: 'p', amount: -1, recycled: true };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '1.years.0.amounts.0.amount': 1 },
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('removes missing flag when missing and recycled update received and no amount left', async () => {
            const amount = { variant: 'p', amount: -2 };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $unset: ['1.missing', '1.years'],
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });
    });

    describe('addVariantAmount', () => {
        it('adds variant amount to empty array', async () => {
            expect(addVariantAmount([], { variant: 'p', amount: 1 })).toStrictEqual([{ variant: 'p', amount: 1 }]);
        });

        it('adds variant amount to array with different variant', async () => {
            expect(addVariantAmount([{ variant: 'd', amount: 1 }], { variant: 'p', amount: 1 })).toStrictEqual([
                { variant: 'd', amount: 1 },
                { variant: 'p', amount: 1 },
            ]);
        });

        it('adds variant amount to array with same variant', async () => {
            expect(addVariantAmount([{ variant: 'p', amount: 1 }], { variant: 'p', amount: 1 })).toStrictEqual([
                { variant: 'p', amount: 2 },
            ]);
        });

        it('adds variant amount to array with more variants', async () => {
            expect(
                addVariantAmount(
                    [
                        { variant: 'd', amount: 1 },
                        { variant: 'p', amount: 1 },
                    ],
                    { variant: 'p', amount: 1 }
                )
            ).toStrictEqual([
                { variant: 'd', amount: 1 },
                { variant: 'p', amount: 2 },
            ]);
        });

        it('adds variant amount to array with negative amount', async () => {
            expect(
                addVariantAmount(
                    [
                        { variant: 'p', amount: 2 },
                        { variant: 'd', amount: 1 },
                    ],
                    { variant: 'p', amount: -1 }
                )
            ).toStrictEqual([
                { variant: 'p', amount: 1 },
                { variant: 'd', amount: 1 },
            ]);
        });

        it('adds variant amount to array with negative amount to get zero in result', async () => {
            expect(
                addVariantAmount(
                    [
                        { variant: 'p', amount: 1 },
                        { variant: 'd', amount: 1 },
                    ],
                    { variant: 'p', amount: -1 }
                )
            ).toStrictEqual([
                { variant: 'p', amount: 0 },
                { variant: 'd', amount: 1 },
            ]);
        });
    });

    describe('renameDetails', () => {
        it('renames details', async () => {
            await expect(renameDetails('Daržovės', 'Agurkai', 'Z')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $set: { '2.name': 'Z' } }));
        });

        it('renames details for different group', async () => {
            await expect(renameDetails('Uogienės', 'Avietės', 'Agrastai')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $set: { '0.name': 'Agrastai' } }));
        });

        it.each`
            title                  | group         | name         | newName
            ${'invalid group'}     | ${'Šaldyti'}  | ${'Krapai'}  | ${'Krabai'}
            ${'invalid name'}      | ${'Daržovės'} | ${'Burokai'} | ${'Runkeliai'}
            ${'same names'}        | ${'Uogienės'} | ${'Avietės'} | ${'Avietės'}
            ${'already used name'} | ${'Uogienės'} | ${'Avietės'} | ${'Braškės'}
            ${'empty group'}       | ${''}         | ${'Krapai'}  | ${'Krabai'}
            ${'empty name'}        | ${'Šaldyti'}  | ${''}        | ${'Krabai'}
            ${'empty new name'}    | ${'Šaldyti'}  | ${'Krapai'}  | ${''}
        `('does not rename details for $title', async ({ group, name, newName }) => {
            await expect(renameDetails(group, name, newName)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('renameDetailsVariant', () => {
        it('renames details variant', async () => {
            await expect(renameDetailsVariant('Daržovės', 'd', '3/4')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.0.variant': '3/4',
                        '2.updates.1.years.0.amounts.0.variant': '3/4',
                    },
                })
            );
        });

        it('renames details variant when some structure data is missing', async () => {
            const d = {
                group: 'Daržovės',
                name: 'Pustuštis',
                years: [
                    { year: 21 },
                    { year: 22, amounts: [{ variant: 'd', amount: 5 }] },
                    { year: 24, amounts: [{ variant: 'd', amount: 5 }] },
                ],
                updates: [
                    {
                        time: Date.parse('2025-01-01T12:00:00.000Z'),
                        years: [
                            { year: 21 },
                            { year: 22, amounts: [{ variant: 'd', amount: -1 }] },
                            { year: 24, amounts: [{ variant: 'd', amount: -2 }] },
                        ],
                    },
                ],
            };

            await (await db()).collection('details').insertOne(d, { forceServerObjectId: true });

            await expect(renameDetailsVariant('Daržovės', 'd', '3/4')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk([...details, d], {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.0.variant': '3/4',
                        '2.updates.1.years.0.amounts.0.variant': '3/4',
                        '4.years.1.amounts.0.variant': '3/4',
                        '4.years.2.amounts.0.variant': '3/4',
                        '4.updates.0.years.1.amounts.0.variant': '3/4',
                        '4.updates.0.years.2.amounts.0.variant': '3/4',
                    },
                })
            );
        });

        it('renames details variant for different group', async () => {
            await expect(renameDetailsVariant('Uogienės', 'p', '1/2')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: {
                        '0.years.0.amounts.0.variant': '1/2',
                        '0.updates.0.years.0.amounts.0.variant': '1/2',
                        '0.updates.0.years.1.amounts.0.variant': '1/2',
                        '0.updates.1.years.0.amounts.0.variant': '1/2',
                        '0.updates.1.years.1.amounts.0.variant': '1/2',
                        '0.updates.2.years.0.amounts.0.variant': '1/2',
                        '1.years.0.amounts.0.variant': '1/2',
                        '1.updates.0.years.0.amounts.0.variant': '1/2',
                        '1.updates.1.years.0.amounts.0.variant': '1/2',
                        '1.updates.2.years.0.amounts.0.variant': '1/2',
                    },
                })
            );
        });

        it('renames details variant on second year', async () => {
            await updateDetails('Daržovės', 'Kopūstai', 22, [{ variant: 'p', amount: 1 }]);

            await expect(renameDetailsVariant('Daržovės', 'p', '1/2')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '3.years.0.amounts.0.variant': '1/2' },
                    $push: {
                        '3.years': { year: 22, amounts: [{ variant: '1/2', amount: 1 }] },
                        '3.updates': { time, years: [{ year: 22, amounts: [{ variant: '1/2', amount: 1 }] }] },
                    },
                })
            );
        });

        it('renames details second variant on first year', async () => {
            await updateDetails('Daržovės', 'Kopūstai', 21, [{ variant: 'd', amount: 1 }]);

            await expect(renameDetailsVariant('Daržovės', 'd', '3/4')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.0.variant': '3/4',
                        '2.updates.1.years.0.amounts.0.variant': '3/4',
                    },
                    $push: {
                        '3.years.0.amounts': { variant: '3/4', amount: 1 },
                        '3.updates': { time, years: [{ year: 21, amounts: [{ variant: '3/4', amount: 1 }] }] },
                    },
                })
            );
        });

        it.each`
            title                  | group         | variant  | newVariant
            ${'invalid group'}     | ${'Šaldyti'}  | ${'p'}   | ${'1/2'}
            ${'invalid variant'}   | ${'Daržovės'} | ${'0.5'} | ${'1/2'}
            ${'same variants'}     | ${'Daržovės'} | ${'p'}   | ${'p'}
            ${'empty group'}       | ${''}         | ${'p'}   | ${'b'}
            ${'empty variant'}     | ${'Daržovės'} | ${''}    | ${'b'}
            ${'empty new variant'} | ${'Daržovės'} | ${'p'}   | ${''}
        `('does not rename variant for $title', async ({ group, variant, newVariant }) => {
            await expect(renameDetailsVariant(group, variant, newVariant)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('renameDetailsGroup', () => {
        it('renames details group', async () => {
            await expect(renameDetailsGroup('Daržovės', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, { $set: { '2.group': 'Šaldyti', '3.group': 'Šaldyti' } })
            );
        });

        it('renames different group', async () => {
            await expect(renameDetailsGroup('Uogienės', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, { $set: { '0.group': 'Šaldyti', '1.group': 'Šaldyti' } })
            );
        });

        it.each`
            title              | group         | newGroup
            ${'invalid group'} | ${'Šaldyti'}  | ${'Uogienės'}
            ${'same groups'}   | ${'Daržovės'} | ${'Daržovės'}
            ${'empty group'}   | ${''}         | ${'Daržovės'}
            ${'empty variant'} | ${'Daržovės'} | ${''}
        `('does not rename group for $title', async ({ group, newGroup }) => {
            await expect(renameDetailsGroup(group, newGroup)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('moveDetails', () => {
        it('moves details', async () => {
            await expect(moveDetails('Daržovės', 'Agurkai', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $set: { '2.group': 'Šaldyti' } }));
        });

        it('moves details from different group', async () => {
            await expect(moveDetails('Uogienės', 'Avietės', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $set: { '0.group': 'Šaldyti' } }));
        });

        it('moves details with new name', async () => {
            await expect(moveDetails('Daržovės', 'Agurkai', 'Šaldyti', 'Agurkėliai')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, { $set: { '2.group': 'Šaldyti', '2.name': 'Agurkėliai' } })
            );
        });

        it('moves details with old name if new name is empty', async () => {
            await expect(moveDetails('Daržovės', 'Agurkai', 'Šaldyti', '')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $set: { '2.group': 'Šaldyti' } }));
        });

        it.each`
            title                       | group         | name         | newGroup
            ${'invalid group'}          | ${'Šaldyti'}  | ${'Krapai'}  | ${'Uogienės'}
            ${'invalid name'}           | ${'Daržovės'} | ${'Braškės'} | ${'Šaldyti'}
            ${'same groups'}            | ${'Daržovės'} | ${'Agurkai'} | ${'Daržovės'}
            ${'same name in new group'} | ${'Uogienės'} | ${'Agurkai'} | ${'Daržovės'}
            ${'empty group'}            | ${''}         | ${'Agurkai'} | ${'Daržovės'}
            ${'empty name'}             | ${'Daržovės'} | ${''}        | ${'Šaldyti'}
            ${'empty new group'}        | ${'Daržovės'} | ${'Agurkai'} | ${''}
        `('does not move details for $title', async ({ group, name, newGroup }) => {
            await expect(moveDetails(group, name, newGroup)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('deleteDetails', () => {
        it('deletes details', async () => {
            await expect(deleteDetails('Daržovės', 'Agurkai')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $remove: 2 }));
        });

        it('deletes details from different group', async () => {
            await expect(deleteDetails('Uogienės', 'Avietės')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(details.slice(1));
        });

        it.each`
            title              | group         | name
            ${'invalid group'} | ${'Šaldyti'}  | ${'Krapai'}
            ${'invalid name'}  | ${'Daržovės'} | ${'Braškės'}
            ${'empty group'}   | ${''}         | ${'Agurkai'}
            ${'empty name'}    | ${'Daržovės'} | ${''}
        `('does not delete details for $title', async ({ group, name }) => {
            await expect(deleteDetails(group, name)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('deleteDetailsVariant', () => {
        it('deletes details variant', async () => {
            await expect(deleteDetailsVariant('Daržovės', 'p')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $unset: ['3.years', '3.updates'] }));
        });

        it('deletes details variant for different group', async () => {
            await expect(deleteDetailsVariant('Uogienės', 'p')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(
                    details,
                    { $unset: ['0.years', '0.updates', '1.years'] },
                    { $shift: ['1.updates', '1.updates.0.years', '1.updates.1.years.0.amounts'] }
                )
            );
        });

        it('deletes details variant for second year', async () => {
            await updateDetails('Daržovės', 'Kopūstai', 22, [
                { variant: 'm', amount: 2 },
                { variant: 'd', amount: 1 },
            ]);

            await expect(deleteDetailsVariant('Daržovės', 'd')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, {
                    $unset: ['2.years', '2.updates'],
                    $push: {
                        '3.years': { year: 22, amounts: [{ variant: 'm', amount: 2 }] },
                        '3.updates': { time, years: [{ year: 22, amounts: [{ variant: 'm', amount: 2 }] }] },
                    },
                })
            );
        });

        it.each`
            title                | group         | variant
            ${'invalid group'}   | ${'Šaldyti'}  | ${'p'}
            ${'invalid variant'} | ${'Daržovės'} | ${'0.5'}
            ${'empty group'}     | ${''}         | ${'Agurkai'}
            ${'empty variant'}   | ${'Daržovės'} | ${''}
        `('does not delete variant for $title', async ({ group, variant }) => {
            await expect(deleteDetailsVariant(group, variant)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('deleteDetailsGroup', () => {
        it('deletes details by group', async () => {
            await expect(deleteDetailsGroup('Daržovės')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(details.slice(0, 2));
        });

        it('deletes details by different group', async () => {
            await expect(deleteDetailsGroup('Uogienės')).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(details.slice(2));
        });

        it.each`
            title              | group
            ${'invalid group'} | ${'Šaldyti'}
            ${'empty group'}   | ${''}
        `('does not delete variant for $title', async ({ group }) => {
            await expect(deleteDetailsGroup(group)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('setRemoving', () => {
        it('sets removing by group, name, and year', async () => {
            await expect(setRemoving('Daržovės', 'Agurkai', 22, true)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, { $set: { '2.years.0.removing': true } })
            );
        });

        it('sets removing by different group, name, and year', async () => {
            await expect(setRemoving('Uogienės', 'Braškės', 22, true)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(
                bulk(details, { $set: { '1.years.0.removing': true } })
            );
        });

        it('sets not removing by group, name, and year', async () => {
            await expect(setRemoving('Daržovės', 'Kopūstai', 21, false)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $unset: '3.years.0.removing' }));
        });

        it.each`
            title                     | group         | name          | year  | removing
            ${'already removing'}     | ${'Daržovės'} | ${'Kopūstai'} | ${21} | ${true}
            ${'already not removing'} | ${'Uogienės'} | ${'Avietės'}  | ${21} | ${false}
            ${'invalid group'}        | ${'Šaldyti'}  | ${'Krapai'}   | ${22} | ${true}
            ${'invalid name'}         | ${'Uogienės'} | ${'Bruknės'}  | ${22} | ${true}
            ${'invalid year'}         | ${'Uogienės'} | ${'Avietės'}  | ${20} | ${true}
            ${'empty group'}          | ${''}         | ${'Krapai'}   | ${22} | ${true}
            ${'empty name'}           | ${'Uogienės'} | ${''}         | ${22} | ${true}
            ${'empty year'}           | ${'Uogienės'} | ${'Avietės'}  | ${0}  | ${true}
        `('does not change removing for $title', async ({ group, name, year, removing }) => {
            await expect(setRemoving(group, name, year, removing)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });

    describe('setMissing', () => {
        it('sets missing item', async () => {
            await expect(setMissing('Uogienės', 'Avietės', true)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $set: { '0.missing': true } }));
        });

        it('unsets missing item', async () => {
            await expect(setMissing('Uogienės', 'Braškės', false)).resolves.toBeTrue();
            await expect($all('details')).resolves.toStrictEqual(bulk(details, { $unset: '1.missing' }));
        });

        it.each`
            title                    | group         | name          | missing
            ${'already missing'}     | ${'Uogienės'} | ${'Braškės'}  | ${true}
            ${'already not missing'} | ${'Uogienės'} | ${'Avietės'}  | ${false}
            ${'invalid group'}       | ${'Šaldyti'}  | ${'Krapai'}   | ${true}
            ${'invalid name'}        | ${'Uogienės'} | ${'Citrinos'} | ${true}
            ${'empty group'}         | ${''}         | ${'Krapai'}   | ${true}
            ${'empty name'}          | ${'Uogienės'} | ${''}         | ${true}
        `('does not change invalid for $title', async ({ group, name, missing }) => {
            await expect(setMissing(group, name, missing)).resolves.toBeFalse();
            await expect($all('details')).resolves.toStrictEqual(details);
        });
    });
});
