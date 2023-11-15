import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { handleRemoveGroup } from '~/server/app/handleRemoveGroup';
import { removeGroup } from '~/server/data/common';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/common');
jest.mock('~/server/app/getAllDetails');

describe('handleRemoveGroup', () => {
    const request = { body: { group: 'G' } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls removeGroup and getAllDetails when removeGroup is successful', async () => {
        (removeGroup as jest.Mock).mockResolvedValue(true);
        await handleRemoveGroup(request, response);

        expect(removeGroup).toHaveBeenCalledWith('G');
        expect(getAllDetails).toHaveBeenCalledWith(request, response);
        expect(response.json).not.toHaveBeenCalled();
    });

    it('calls removeGroup and responds with json when removeGroup is not successful', async () => {
        (removeGroup as jest.Mock).mockResolvedValue(false);
        await handleRemoveGroup(request, response);

        expect(removeGroup).toHaveBeenCalledWith('G');
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
