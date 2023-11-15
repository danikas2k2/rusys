import { type Request, type Response } from 'express';
import { handleSetDetails } from '~/server/app/handleSetDetails';
import { getDetails, setDetails } from '~/server/data/details';
import { getYears } from '~/server/data/years';
import { type AmountSet } from '../../state/details/types';
import { type Years } from '../../state/years/types';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/years');

describe('handleSetDetails', () => {
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

    const request = { body: { group: 'G', name: 'A', details, updateWithoutHistory: false } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls setDetails and responds with json when setDetails is successful', async () => {
        (setDetails as jest.Mock).mockResolvedValue(true);
        (getDetails as jest.Mock).mockResolvedValue({ details });
        (getYears as jest.Mock).mockReturnValue(years);
        await handleSetDetails(request, response);

        expect(setDetails).toHaveBeenCalledWith('G', 'A', details, false);
        expect(getDetails).toHaveBeenCalledWith(years);
        expect(response.json).toHaveBeenCalledWith({
            ok: true,
            years,
            details: { details },
        });
    });

    it('calls setDetails and responds with json when setDetails is not successful', async () => {
        (setDetails as jest.Mock).mockResolvedValue(false);
        await handleSetDetails(request, response);

        expect(setDetails).toHaveBeenCalledWith('G', 'A', details, false);
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
