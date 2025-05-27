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

    it('getDetailsWithYears', async () =>
        await expect(getDetailsWithYears()).resolves.toStrictEqual({
            years,
            details,
        }));

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
