/** @jest-environment node */
/** @jest-environment node */
import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';

import {
    getDetailsWithGroups,
    getDetailsWithVariants,
    getDetailsWithYears,
    getGroupsResponse,
    getVariantsResponse,
    getVariantsWithGroups,
} from '~/server/api/response';
import { getDetails } from '~/server/data/details';
import { getGroups } from '~/server/data/groups';
import { getVariants } from '~/server/data/variants';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');
jest.mock('~/server/data/details');
jest.mock('~/server/data/variants');
jest.mock('~/server/data/groups');

describe('details', () => {
    const years = getYearsFixture();
    const details = getDetailsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    beforeEach(async () => {
        jest.mocked(getDetails).mockResolvedValue(details);
        jest.mocked(getVariants).mockResolvedValue(variants);
        jest.mocked(getGroups).mockResolvedValue(groups);
    });

    afterEach(async () => jest.clearAllMocks());

    describe('getDetailsWithYears', () => {
        it('handlers details', async () =>
            await expect(getDetailsWithYears()).resolves.toStrictEqual({
                years,
                details,
            }));

        it('handles details without years field', async () => {
            const detailsWithoutYears: typeof details = [
                { group: 'Test', name: 'Test Item' }, // no years field
                { group: 'Test2', name: 'Test Item 2', years: undefined }, // explicit undefined
            ];

            jest.mocked(getDetails).mockResolvedValueOnce(detailsWithoutYears);

            const result = await getDetailsWithYears();

            expect(result.details).toStrictEqual(detailsWithoutYears);
            expect(result.years).toStrictEqual(years.slice(0, 5).sort((a, b) => b - a));
        });

        it('handles duplicate years (does not add same year twice)', async () => {
            const detailsWithDuplicateYears: typeof details = [
                {
                    group: 'Test',
                    name: 'Test Item',
                    years: [
                        { year: 22, amounts: [] },
                        { year: 22, amounts: [] }, // duplicate
                        { year: 21, amounts: [] },
                    ],
                },
            ];

            jest.mocked(getDetails).mockResolvedValueOnce(detailsWithDuplicateYears);

            const result = await getDetailsWithYears();

            expect(result.details).toStrictEqual(detailsWithDuplicateYears);

            const expectedYears = [22, 21, ...years.slice(0, 5)];
            const uniqueYears = [...new Set(expectedYears)].sort((a, b) => b - a);

            expect(result.years).toStrictEqual(uniqueYears);
        });

        it('handles mixed details with and without years', async () => {
            const mixedDetails: typeof details = [
                { group: 'Test1', name: 'No Years' }, // no years
                {
                    group: 'Test2',
                    name: 'With Years',
                    years: [
                        { year: 20, amounts: [] },
                        { year: 21, amounts: [] },
                    ],
                },
                { group: 'Test3', name: 'Also No Years' }, // no years
            ];

            jest.mocked(getDetails).mockResolvedValueOnce(mixedDetails);

            const result = await getDetailsWithYears();

            expect(result.details).toStrictEqual(mixedDetails);

            const expectedYears = [20, 21, ...years.slice(0, 5)];
            const uniqueYears = [...new Set(expectedYears)].sort((a, b) => b - a);

            expect(result.years).toStrictEqual(uniqueYears);
        });
    });

    it('getDetailsWithVariants', async () =>
        await expect(getDetailsWithVariants()).resolves.toStrictEqual({
            years,
            details,
            variants,
        }));

    it('getAllDetails', async () =>
        await expect(getDetailsWithGroups()).resolves.toStrictEqual({
            years,
            details,
            groups,
            variants,
        }));

    it('getGroupsResponse', async () => await expect(getGroupsResponse()).resolves.toStrictEqual({ groups }));

    it('getVariantsResponse', async () => await expect(getVariantsResponse()).resolves.toStrictEqual({ variants }));

    it('getVariantsWithGroups', async () =>
        await expect(getVariantsWithGroups()).resolves.toStrictEqual({ variants, groups }));
});
