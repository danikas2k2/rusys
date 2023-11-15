import { type Request, type Response } from 'express';
import { handleSummary } from '~/server/app/handleSummary';
import { getSummary } from '~/server/data/updates';
import { getYears } from '~/server/data/years';
import { type AmountSet } from '~/state/details/types';
import { type Years } from '~/state/years/types';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/updates');
jest.mock('~/server/data/years');

describe('handleSummary', () => {
    const years: Years = [21, 22, 23];

    const summary: AmountSet = {
        '': {
            A: { 22: { '': 1 } },
            B: { 22: { '': 1 } },
        },
        G: {
            A: { 22: { d: 1 } },
        },
    };

    const request = {} as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('responds with json containing years and summary when getSummary is successful', async () => {
        (getYears as jest.Mock).mockReturnValue(years);
        (getSummary as jest.Mock).mockResolvedValue(summary);
        await handleSummary(request, response);

        expect(getYears).toHaveBeenCalled();
        expect(getSummary).toHaveBeenCalledWith(years);
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, summary });
    });
});
