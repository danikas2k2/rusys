import { type Request, type Response } from 'express';
import { handleSetRemoving } from '~/server/app/handleSetRemoving';
import { getRemoving, setRemoving } from '~/server/data/removing';
import { getYears } from '~/server/data/years';
import { type RemovingSet } from '~/state/removing/types';
import { type Years } from '~/state/years/types';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/removing');
jest.mock('~/server/data/years');

describe('handleSetRemoving', () => {
    const years: Years = [21, 22, 23];

    const removing: RemovingSet = {
        '': {
            A: { 21: true },
            B: { 22: true },
        },
        G: {
            A: { 22: true },
        },
    };

    const request = { body: { group: 'G', name: 'A', year: 21, removing } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls setRemoving and responds with json when setRemoving is successful', async () => {
        (setRemoving as jest.Mock).mockResolvedValue(true);
        (getRemoving as jest.Mock).mockResolvedValue(removing);
        (getYears as jest.Mock).mockReturnValue(years);
        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('G', 'A', 21, removing);
        expect(getYears).toHaveBeenCalled();
        expect(getRemoving).toHaveBeenCalledWith(years);
        expect(response.json).toHaveBeenCalledWith({ ok: true, years, removing });
    });

    it('calls setRemoving and responds with json when setRemoving is not successful', async () => {
        (setRemoving as jest.Mock).mockResolvedValue(false);
        await handleSetRemoving(request, response);

        expect(setRemoving).toHaveBeenCalledWith('G', 'A', 21, removing);
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
