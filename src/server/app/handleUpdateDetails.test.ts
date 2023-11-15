import { type Request, type Response } from 'express';
import { handleUpdateDetails } from '~/server/app/handleUpdateDetails';
import { getDetails, updateDetails } from '~/server/data/details';
import { getYears } from '~/server/data/years';
import { type Amount, type AmountSet } from '../../state/details/types';
import { type Years } from '../../state/years/types';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/details');
jest.mock('~/server/data/years');

describe('handleUpdateDetails', () => {
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

    const value: Amount = { d: 2 };

    const request = { body: { name: 'A', year: 21, value, updateWithoutHistory: false } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls updateDetails and responds with json when updateDetails is successful', async () => {
        (updateDetails as jest.Mock).mockResolvedValue(true);
        (getDetails as jest.Mock).mockResolvedValue(details);
        (getYears as jest.Mock).mockReturnValue(years);
        await handleUpdateDetails(request, response);

        expect(updateDetails).toHaveBeenCalledWith('A', 21, value, false);
        expect(getYears).toHaveBeenCalled();
        expect(getDetails).toHaveBeenCalledWith(years);
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, details });
    });

    it('calls updateDetails and responds with json when updateDetails is not successful', async () => {
        (updateDetails as jest.Mock).mockResolvedValue(false);
        const req = { body: { name: 'A', year: 21, value, updateWithoutHistory: false } } as unknown as Request;
        const res = { json: jest.fn() } as unknown as Response;

        await handleUpdateDetails(req, res);

        expect(updateDetails).toHaveBeenCalledWith('A', 21, value, false);
        expect(res.json).toHaveBeenCalledWith({ ok: false });
    });
});
