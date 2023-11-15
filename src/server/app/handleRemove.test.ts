import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { handleRemove } from '~/server/app/handleRemove';
import { remove } from '~/server/data/common';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/app/getAllDetails');

describe('handleRemove', () => {
    const request = { body: { group: 'G', name: 'A' } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    it('calls remove and getAllDetails when remove is successful', async () => {
        (remove as jest.Mock).mockResolvedValue(true);
        await handleRemove(request, response);

        expect(remove).toHaveBeenCalledWith('G', 'A');
        expect(getAllDetails).toHaveBeenCalledWith(request, response);
        expect(response.json).not.toHaveBeenCalled();
    });

    it('calls remove and responds with json when remove is not successful', async () => {
        (remove as jest.Mock).mockResolvedValue(false);
        await handleRemove(request, response);

        expect(remove).toHaveBeenCalledWith('G', 'A');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
