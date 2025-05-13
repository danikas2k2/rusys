/** @jest-environment node */
import { bulk } from '@tests/bulk';
import { getDetailsFixture } from '@tests/fixtures';
import {
    addDetails,
    deleteDetails,
    deleteDetailsGroup,
    deleteDetailsVariant,
    getDetails,
    moveDetails,
    renameDetails,
    renameDetailsGroup,
    renameDetailsVariant,
    setMissing,
    setRemoving,
    updateDetails,
} from '~/server/data/details';
import { getAllDetails } from '~/server/data/tests/utils';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');

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

        it('returns no details for missing years', async () => {
            await expect(getDetails([23, 24])).resolves.toStrictEqual([]);
        });

        it('returns no details for empty array', async () => {
            await expect(getDetails([])).resolves.toStrictEqual([]);
        });
    });

    const time = expect.any(Number);

    describe('addDetails', () => {
        it('adds details for new group and specified name', async () => {
            await expect(addDetails('Šaldyti', 'Cukai')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual([...details, { group: 'Šaldyti', name: 'Cukai' }]);
        });

        it('does not add details if group is missing', async () => {
            await expect(addDetails('', 'Cukai')).resolves.toBeFalse();
        });

        it('does not add details if name is missing', async () => {
            await expect(addDetails('Šaldyti', '')).resolves.toBeFalse();
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
            await expect(getAllDetails()).resolves.toStrictEqual(
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
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '2.years.0.amounts': [{ variant: 'd', amount: 1 }, amount] },
                    $push: { '2.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('updates details for existing group, name and year but without amounts', async () => {
            await expect(updateDetails('Uogienės', 'Avietės', 21)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not update details if no value and year missing', async () => {
            await expect(updateDetails('Uogienės', 'Avietės', 22)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('updates details for new group, existing name, and different year without value', async () => {
            await expect(updateDetails('Šaldyti', 'Krapai', 22)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('updates details for existing group, name, and year without value', async () => {
            await expect(updateDetails('Daržovės', 'Agurkai', 22)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('removes missing flag when missing and negative update received', async () => {
            const amount = { variant: 'p', amount: -1 };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect(getAllDetails()).resolves.toStrictEqual(
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

            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '1.years.0.amounts.0.amount': 3 },
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('does not remove missing flag when missing and recycled update received', async () => {
            const amount = { variant: 'p', amount: -1, recycled: true };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, {
                    $set: { '1.years.0.amounts.0.amount': 1 },
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });

        it('removes missing flag when missing and recycled update received and no amount left', async () => {
            const amount = { variant: 'p', amount: -2 };
            await updateDetails('Uogienės', 'Braškės', 22, [amount]);

            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, {
                    $unset: ['1.missing'],
                    $set: { '1.years': [] },
                    $push: { '1.updates': { time, years: [{ year: 22, amounts: [amount] }] } },
                })
            );
        });
    });

    describe('renameDetails', () => {
        it('renames details', async () => {
            await expect(renameDetails('Daržovės', 'Agurkai', 'Z')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $set: { '2.name': 'Z' } }));
        });

        it('renames details for different group', async () => {
            await expect(renameDetails('Uogienės', 'Avietės', 'Agrastai')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $set: { '0.name': 'Agrastai' } }));
        });

        it('does not rename if name not found', async () => {
            await expect(renameDetails('Daržovės', 'Burokai', 'Runkeliai')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not rename if group not found', async () => {
            await expect(renameDetails('Šaldyti', 'Krapai', 'Krabai')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not rename if names are the same', async () => {
            await expect(renameDetails('Uogienės', 'Avietės', 'Avietės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not rename if name already in use', async () => {
            await expect(renameDetails('Uogienės', 'Avietės', 'Braškės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('renameDetailsVariant', () => {
        it('renames details variant', async () => {
            await expect(renameDetailsVariant('Daržovės', 'd', '3/4')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, {
                    $set: {
                        '2.years.0.amounts.0.variant': '3/4',
                        '2.updates.0.years.0.amounts.0.variant': '3/4',
                        '2.updates.1.years.0.amounts.0.variant': '3/4',
                    },
                })
            );
        });

        it('renames details variant for different group', async () => {
            await expect(renameDetailsVariant('Uogienės', 'p', '1/2')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
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
            await expect(getAllDetails()).resolves.toStrictEqual(
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
            await expect(getAllDetails()).resolves.toStrictEqual(
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

        it('does not rename if name not found', async () => {
            await expect(renameDetailsVariant('Daržovės', '0.5', '1/2')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not rename if group not found', async () => {
            await expect(renameDetailsVariant('Šaldyti', 'p', '1/2')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('renameDetailsGroup', () => {
        it('renames details group', async () => {
            await expect(renameDetailsGroup('Daržovės', 'Šaldyti')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, { $set: { '2.group': 'Šaldyti', '3.group': 'Šaldyti' } })
            );
        });

        it('renames different group', async () => {
            await expect(renameDetailsGroup('Uogienės', 'Šaldyti')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, { $set: { '0.group': 'Šaldyti', '1.group': 'Šaldyti' } })
            );
        });

        it('does not rename if group not found', async () => {
            await expect(renameDetailsGroup('Šaldyti', 'Uogienės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not rename if group is the same', async () => {
            await expect(renameDetailsGroup('Daržovės', 'Daržovės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('moveDetails', () => {
        it('moves details', async () => {
            await expect(moveDetails('Daržovės', 'Agurkai', 'Šaldyti')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $set: { '2.group': 'Šaldyti' } }));
        });

        it('moves details from different group', async () => {
            await expect(moveDetails('Uogienės', 'Avietės', 'Šaldyti')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $set: { '0.group': 'Šaldyti' } }));
        });

        it('does not move if name not found', async () => {
            await expect(moveDetails('Daržovės', 'B', 'Šaldyti')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not move if group not found', async () => {
            await expect(moveDetails('Šaldyti', 'Krapai', 'Uogienės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not move if groups are the same', async () => {
            await expect(moveDetails('Daržovės', 'Agurkai', 'Daržovės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not move if name already exists in target group', async () => {
            await expect(moveDetails('Uogienės', 'Agurkai', 'Daržovės')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('deleteDetails', () => {
        it('deletes details', async () => {
            await expect(deleteDetails('Daržovės', 'Agurkai')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $remove: 2 }));
        });

        it('deletes details from different group', async () => {
            await expect(deleteDetails('Uogienės', 'Avietės')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(details.slice(1));
        });

        it('does not delete if group not found', async () => {
            await expect(deleteDetails('Šaldyti', 'Krapai')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not delete if name not found', async () => {
            await expect(deleteDetails('Daržovės', 'B')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('deleteDetailsVariant', () => {
        it('deletes details variant', async () => {
            await expect(deleteDetailsVariant('Daržovės', 'p')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $unset: ['3.years', '3.updates'] }));
        });

        it('deletes details variant for different group', async () => {
            await expect(deleteDetailsVariant('Uogienės', 'p')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
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
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, {
                    $unset: ['2.years', '2.updates'],
                    $push: {
                        '3.years': { year: 22, amounts: [{ variant: 'm', amount: 2 }] },
                        '3.updates': { time, years: [{ year: 22, amounts: [{ variant: 'm', amount: 2 }] }] },
                    },
                })
            );
        });

        it('does not delete if variant not found', async () => {
            await expect(deleteDetailsVariant('Daržovės', '0.5')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does not delete if group not found', async () => {
            await expect(deleteDetailsVariant('Šaldyti', 'p')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('deleteDetailsGroup', () => {
        it('deletes details by group', async () => {
            await expect(deleteDetailsGroup('Daržovės')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(details.slice(0, 2));
        });

        it('deletes details by different group', async () => {
            await expect(deleteDetailsGroup('Uogienės')).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(details.slice(2));
        });

        it('does not delete if group not found', async () => {
            await expect(deleteDetailsGroup('Šaldyti')).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('setRemoving', () => {
        it('sets removing by group, name, and year', async () => {
            await expect(setRemoving('Daržovės', 'Agurkai', 22, true)).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, { $set: { '2.years.0.removing': true } })
            );
        });

        it('sets removing by different group, name, and year', async () => {
            await expect(setRemoving('Uogienės', 'Braškės', 22, true)).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(
                bulk(details, { $set: { '1.years.0.removing': true } })
            );
        });

        it('sets not removing by group, name, and year', async () => {
            await expect(setRemoving('Daržovės', 'Kopūstai', 21, false)).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $unset: '3.years.0.removing' }));
        });

        it('does nothing if already removing', async () => {
            await expect(setRemoving('Daržovės', 'Kopūstai', 21, true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if already not removing', async () => {
            await expect(setRemoving('Uogienės', 'Avietės', 21, false)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if year not found', async () => {
            await expect(setRemoving('Daržovės', 'Braškės', 21, true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if name not found', async () => {
            await expect(setRemoving('Daržovės', 'Z', 22, true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if group not found', async () => {
            await expect(setRemoving('Šaldyti', 'Krapai', 22, true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });

    describe('setMissing', () => {
        it('sets missing item', async () => {
            await expect(setMissing('Uogienės', 'Avietės', true)).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $set: { '0.missing': true } }));
        });

        it('unsets missing item', async () => {
            await expect(setMissing('Uogienės', 'Braškės', false)).resolves.toBeTrue();
            await expect(getAllDetails()).resolves.toStrictEqual(bulk(details, { $unset: '1.missing' }));
        });

        it('does nothing if already missing', async () => {
            await expect(setMissing('Uogienės', 'Braškės', true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if already not missing', async () => {
            await expect(setMissing('Uogienės', 'Avietės', false)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if name not found', async () => {
            await expect(setMissing('Uogienės', 'Citrinos', true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });

        it('does nothing if group not found', async () => {
            await expect(setMissing('Šaldyti', 'Krapai', true)).resolves.toBeFalse();
            await expect(getAllDetails()).resolves.toStrictEqual(details);
        });
    });
});
