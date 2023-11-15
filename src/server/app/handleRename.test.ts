import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { handleRename } from '~/server/app/handleRename';
import { rename } from '~/server/data/common';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/app/getAllDetails');

describe('handleRename', () => {
    afterEach(() => jest.clearAllMocks());

    it('calls rename and getAllDetails when rename is successful', async () => {
        (rename as jest.Mock).mockResolvedValue(true);
        const req = { body: { group: 'group', name: 'name', newName: 'newName' } } as unknown as Request;
        const res = { json: jest.fn() } as unknown as Response;

        await handleRename(req, res);

        expect(rename).toHaveBeenCalledWith('group', 'name', 'newName');
        expect(getAllDetails).toHaveBeenCalledWith(req, res);
        expect(res.json).not.toHaveBeenCalled();
    });

    it('calls rename and responds with json when rename is not successful', async () => {
        (rename as jest.Mock).mockResolvedValue(false);
        const req = { body: { group: 'group', name: 'name', newName: 'newName' } } as unknown as Request;
        const res = { json: jest.fn() } as unknown as Response;

        await handleRename(req, res);

        expect(rename).toHaveBeenCalledWith('group', 'name', 'newName');
        expect(res.json).toHaveBeenCalledWith({ ok: false });
    });
});
