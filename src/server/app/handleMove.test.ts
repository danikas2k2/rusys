import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { handleMove } from '~/server/app/handleMove';
import { move } from '~/server/data/common';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/app/getAllDetails');

describe('handleMove', () => {
    const request = { body: { group: 'G', name: 'A', newGroup: 'B' } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls move and getAllDetails when move is successful', async () => {
        (move as jest.Mock).mockResolvedValue(true);
        await handleMove(request, response);

        expect(move).toHaveBeenCalledWith('G', 'A', 'B');
        expect(getAllDetails).toHaveBeenCalledWith(request, response);
        expect(response.json).not.toHaveBeenCalled();
    });

    it('calls move and responds with json when move is not successful', async () => {
        (move as jest.Mock).mockResolvedValue(false);
        await handleMove(request, response);

        expect(move).toHaveBeenCalledWith('G', 'A', 'B');
        expect(getAllDetails).not.toHaveBeenCalledWith();
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
