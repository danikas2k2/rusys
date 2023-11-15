import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { getDetails } from '~/server/data/details';
import { getMissing } from '~/server/data/missing';
import { getRemoving } from '~/server/data/removing';
import { getYears } from '~/server/data/years';
import { type AmountSet } from '~/state/details/types';
import { type Missing } from '~/state/missing/types';
import { type RemovingSet } from '~/state/removing/types';
import { type Years } from '~/state/years/types';

jest.mock('~/server/db');
jest.mock('~/server/data/details');
jest.mock('~/server/data/missing');
jest.mock('~/server/data/removing');
jest.mock('~/server/data/years');

describe('getAllDetails', () => {
    const years: Years = [21, 22, 23];

    const details: AmountSet = {
        '': {
            A: { 21: { '': 2 } },
            B: { 22: { '': 1 } },
        },
        G: {
            A: { 22: { d: 1 } },
            C: { 21: { '': 2 } },
        },
    };

    const removing: RemovingSet = {
        '': {
            A: { 21: true },
            B: { 22: true },
        },
        G: {
            A: { 22: true },
        },
    };

    const missing: Missing = [
        { group: '', name: 'A' },
        { group: '', name: 'B' },
        { group: '', name: 'C' },
        { group: 'G', name: 'A' },
    ];

    const json = jest.fn();

    beforeAll(() => {
        (getYears as jest.Mock).mockReturnValue(years);
        (getDetails as jest.Mock).mockResolvedValue(details);
        (getRemoving as jest.Mock).mockResolvedValue(removing);
        (getMissing as jest.Mock).mockResolvedValue(missing);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns all details when all data fetching is successful', async () => {
        await getAllDetails({} as Request, { json } as unknown as Response);
        expect(json).toHaveBeenCalledWith({
            ok: true,
            years,
            details,
            removing,
            missing,
        });
    });
});
