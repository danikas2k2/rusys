import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { renameGroup } from '~/server/data/common';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/app/getAllDetails');

describe('handleRenameGroup', () => {
    const request = { body: { group: 'G', newGroup: 'H' } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls renameGroup and getAllDetails when renameGroup is successful', async () => {
        (renameGroup as jest.Mock).mockResolvedValue(true);
        await handleRenameGroup(request, response);

        expect(renameGroup).toHaveBeenCalledWith('G', 'H');
        expect(getAllDetails).toHaveBeenCalledWith(request, response);
        expect(response.json).not.toHaveBeenCalled();
    });

    it('calls renameGroup and responds with json when renameGroup is not successful', async () => {
        (renameGroup as jest.Mock).mockResolvedValue(false);
        await handleRenameGroup(request, response);

        expect(renameGroup).toHaveBeenCalledWith('G', 'H');
        expect(getAllDetails).not.toHaveBeenCalledWith();
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
