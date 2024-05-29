/** @jest-environment node */
import {
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
    updateDetailsAmounts,
    updateDetailsYears,
} from '~/server/data/details';
import { getAllDetails } from '~/server/data/tests/utils';
import { getDetailsCollection } from '~/server/db';
import { getDetailsFixture } from '~/tests/fixtures';
import { bulk } from '~/utils/bulk';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('details', () => {
    jest.setTimeout(30_000);

    const details = getDetailsFixture();

    beforeEach(async () => {
        await (await getDetailsCollection()).insertMany(details, { forceServerObjectId: true });
    });

    afterEach(async () => {
        await (await getDetailsCollection()).deleteMany({});
    });

    describe('getDetails', () => {
        it('returns details for specified years', async () => {
            expect(await getDetails([21, 22])).toEqual([
                { group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
                { group: 'G', name: 'C', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }] },
                { group: 'J', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
                { group: 'J', name: 'B', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }], missing: true },
            ]);
        });

        it('returns details for different years', async () => {
            expect(await getDetails([20, 21])).toEqual([
                { group: 'G', name: 'C', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }] },
                { group: 'J', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
            ]);
        });

        it('returns no details for missing years', async () => {
            expect(await getDetails([23, 24])).toEqual([]);
        });
    });

    const time = expect.any(Number);

    describe('updateDetailsYears', () => {
        const years = [
            { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
            { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
        ];

        it('updates details for specified group and name', async () => {
            expect(await updateDetailsYears('G', 'A', years)).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $set: { '2.years': years },
                    $push: { '2.updates': { time, years: bulk(years, { $set: { '1.amounts.0.amount': 1 } }) } },
                })
            );
        });

        it('updates details for specified group and name without history', async () => {
            expect(await updateDetailsYears('G', 'A', years, true)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '2.years': years } }));
        });

        it('updates details for different group and name', async () => {
            expect(await updateDetailsYears('J', 'A', years)).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $set: { '0.years': years },
                    $push: { '0.updates': { time, years: bulk(years, { $set: { '0.amounts.0.amount': -1 } }) } },
                })
            );
        });

        it('adds details for new group and specified name', async () => {
            expect(await updateDetailsYears('H', 'C', years)).toBeTrue();
            expect(await getAllDetails()).toEqual([
                ...details,
                { group: 'H', name: 'C', years: years, updates: [{ time, years: years }] },
            ]);
        });

        it('updates without details for specified group and name', async () => {
            expect(await updateDetailsYears('G', 'A')).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $unset: '2.years',
                    $push: { '2.updates': { time, years: [bulk(years[1], { $set: { 'amounts.0.amount': -1 } })] } },
                })
            );
        });

        it('updates without details for specified group and name without history', async () => {
            expect(await updateDetailsYears('G', 'A', undefined, true)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $unset: '2.years' }));
        });

        it('updates without details for different group and name', async () => {
            expect(await updateDetailsYears('J', 'A')).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $unset: '0.years',
                    $push: { '0.updates': { time, years: [bulk(years[0], { $set: { 'amounts.0.amount': -2 } })] } },
                })
            );
        });

        it('updates without details for new group and specified name', async () => {
            expect(await updateDetailsYears('H', 'A')).toBeTrue();
            expect(await getAllDetails()).toEqual([...details, { group: 'H', name: 'A' }]);
        });
    });

    describe('updateDetailsAmounts', () => {
        const amounts = [
            { variant: 'p', amount: 1 },
            { variant: 'm', amount: 2 },
            { variant: 'd', amount: 3 },
        ];

        it('updates details for existing group, name, and year', async () => {
            expect(await updateDetailsAmounts('G', 'A', 22, amounts)).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $set: { '2.years.0': { year: 22, amounts } },
                    $push: {
                        '2.updates': {
                            time,
                            years: [{ year: 22, amounts: bulk(amounts, { $set: { '2.amount': 2 } }) }],
                        },
                    },
                })
            );
        });

        it('updates details for existing group, name, and year without history', async () => {
            expect(await updateDetailsAmounts('G', 'A', 22, amounts, true)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '2.years.0': { year: 22, amounts } } }));
        });

        it('updates details for different existing group, name and year', async () => {
            expect(await updateDetailsAmounts('J', 'A', 22, amounts)).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $set: { '0.years.1': { year: 22, amounts } },
                    $push: { '0.updates': { time, years: [{ year: 22, amounts }] } },
                })
            );
        });

        it('updates details for existing group, name and year but without value', async () => {
            expect(await updateDetailsAmounts('J', 'A', 21)).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $unset: '0.years',
                    $push: { '0.updates': { time, years: [{ year: 21, amounts: [{ variant: 'p', amount: -2 }] }] } },
                })
            );
        });

        it('does not update details if no value and year missing', async () => {
            expect(await updateDetailsAmounts('J', 'A', 22)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('updates details for new group, existing name, and different year without value', async () => {
            expect(await updateDetailsAmounts('H', 'A', 22)).toBeTrue();
            expect(await getAllDetails()).toEqual([...details, { group: 'H', name: 'A' }]);
        });

        it('updates details for existing group, name, and year without value', async () => {
            expect(await updateDetailsAmounts('G', 'A', 22)).toBeTrue();
            expect(await getAllDetails()).toEqual(
                bulk(details, {
                    $unset: '2.years',
                    $push: { '2.updates': { time, years: [{ year: 22, amounts: [{ variant: 'd', amount: -1 }] }] } },
                })
            );
        });
    });

    describe('renameDetails', () => {
        it('renames details', async () => {
            expect(await renameDetails('G', 'A', 'Z')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '2.name': 'Z' } }));
        });

        it('renames details for different group', async () => {
            expect(await renameDetails('J', 'A', 'Z')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '0.name': 'Z' } }));
        });

        it('does not rename if name not found', async () => {
            expect(await renameDetails('G', 'B', 'Z')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not rename if group not found', async () => {
            expect(await renameDetails('H', 'A', 'Z')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not rename if names are the same', async () => {
            expect(await renameDetails('J', 'A', 'A')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not rename if name already in use', async () => {
            expect(await renameDetails('J', 'A', 'B')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('renameDetailsVariant', () => {
        it('renames details variant', async () => {
            expect(await renameDetailsVariant('G', 'd', '3/4')).toBeTrue();
            expect(await getAllDetails()).toEqual(
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
            expect(await renameDetailsVariant('J', 'p', '1/2')).toBeTrue();
            expect(await getAllDetails()).toEqual(
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
                    },
                })
            );
        });

        it('renames details variant on second year', async () => {
            await updateDetailsAmounts('G', 'C', 22, [{ variant: 'p', amount: 1 }]);
            expect(await renameDetailsVariant('G', 'p', '1/2')).toBeTrue();
            expect(await getAllDetails()).toEqual(
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
            await updateDetailsAmounts('G', 'C', 21, [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 1 },
            ]);
            expect(await renameDetailsVariant('G', 'd', '3/4')).toBeTrue();
            expect(await getAllDetails()).toEqual(
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
            expect(await renameDetailsVariant('G', '0.5', '1/2')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not rename if group not found', async () => {
            expect(await renameDetailsVariant('H', 'p', '1/2')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('renameDetailsGroup', () => {
        it('renames details group', async () => {
            expect(await renameDetailsGroup('G', 'H')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '2.group': 'H', '3.group': 'H' } }));
        });

        it('renames different group', async () => {
            expect(await renameDetailsGroup('J', 'H')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '0.group': 'H', '1.group': 'H' } }));
        });

        it('does not rename if group not found', async () => {
            expect(await renameDetailsGroup('H', 'J')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not rename if group is the same', async () => {
            expect(await renameDetailsGroup('G', 'G')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('moveDetails', () => {
        it('moves details', async () => {
            expect(await moveDetails('G', 'A', 'H')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '2.group': 'H' } }));
        });

        it('moves details from different group', async () => {
            expect(await moveDetails('J', 'A', 'H')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '0.group': 'H' } }));
        });

        it('does not move if name not found', async () => {
            expect(await moveDetails('G', 'B', 'H')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not move if group not found', async () => {
            expect(await moveDetails('H', 'A', 'J')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not move if groups are the same', async () => {
            expect(await moveDetails('G', 'A', 'G')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not move if name already exists in target group', async () => {
            expect(await moveDetails('J', 'A', 'G')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteDetails', () => {
        it('deletes details', async () => {
            expect(await deleteDetails('G', 'A')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $remove: 2 }));
        });

        it('deletes details from different group', async () => {
            expect(await deleteDetails('J', 'A')).toBeTrue();
            expect(await getAllDetails()).toEqual(details.slice(1));
        });

        it('does not delete if group not found', async () => {
            expect(await deleteDetails('H', 'A')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not delete if name not found', async () => {
            expect(await deleteDetails('G', 'B')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteDetailsVariant', () => {
        it('deletes details variant', async () => {
            expect(await deleteDetailsVariant('G', 'p')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $unset: ['3.years', '3.updates'] }));
        });

        it('deletes details variant for different group', async () => {
            expect(await deleteDetailsVariant('J', 'p')).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $unset: ['0.years', '0.updates', '1.years', '1.updates'] }));
        });

        it('deletes details variant for second year', async () => {
            await updateDetailsAmounts('G', 'C', 22, [
                { variant: 'm', amount: 2 },
                { variant: 'd', amount: 1 },
            ]);
            expect(await deleteDetailsVariant('G', 'd')).toBeTrue();
            expect(await getAllDetails()).toEqual(
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
            expect(await deleteDetailsVariant('G', '0.5')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does not delete if group not found', async () => {
            expect(await deleteDetailsVariant('H', 'p')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('deleteDetailsGroup', () => {
        it('deletes details by group', async () => {
            expect(await deleteDetailsGroup('G')).toBeTrue();
            expect(await getAllDetails()).toEqual(details.slice(0, 2));
        });

        it('deletes details by different group', async () => {
            expect(await deleteDetailsGroup('J')).toBeTrue();
            expect(await getAllDetails()).toEqual(details.slice(2));
        });

        it('does not delete if group not found', async () => {
            expect(await deleteDetailsGroup('H')).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('setRemoving', () => {
        it('sets removing by group, name, and year', async () => {
            expect(await setRemoving('G', 'A', 22, true)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '2.years.0.removing': true } }));
        });

        it('sets removing by different group, name, and year', async () => {
            expect(await setRemoving('J', 'B', 22, true)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '1.years.0.removing': true } }));
        });

        it('sets not removing by group, name, and year', async () => {
            expect(await setRemoving('G', 'C', 21, false)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $unset: '3.years.0.removing' }));
        });

        it('does nothing if already removing', async () => {
            expect(await setRemoving('G', 'C', 21, true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if already not removing', async () => {
            expect(await setRemoving('J', 'A', 21, false)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if year not found', async () => {
            expect(await setRemoving('G', 'A', 21, true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if name not found', async () => {
            expect(await setRemoving('G', 'Z', 22, true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if group not found', async () => {
            expect(await setRemoving('H', 'A', 22, true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });

    describe('setMissing', () => {
        it('sets missing item', async () => {
            expect(await setMissing('J', 'A', true)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $set: { '0.missing': true } }));
        });

        it('unsets missing item', async () => {
            expect(await setMissing('J', 'B', false)).toBeTrue();
            expect(await getAllDetails()).toEqual(bulk(details, { $unset: '1.missing' }));
        });

        it('does nothing if already missing', async () => {
            expect(await setMissing('J', 'B', true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if already not missing', async () => {
            expect(await setMissing('J', 'A', false)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if name not found', async () => {
            expect(await setMissing('J', 'C', true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });

        it('does nothing if group not found', async () => {
            expect(await setMissing('H', 'A', true)).toBeFalse();
            expect(await getAllDetails()).toEqual(details);
        });
    });
});
