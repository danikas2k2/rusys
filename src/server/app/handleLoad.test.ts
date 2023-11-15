import { type Request, type Response } from 'express';
import { getAllDetails } from '~/server/app/getAllDetails';
import { handleLoad } from '~/server/app/handleLoad';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/app/getAllDetails');

describe('handleLoad', () => {
    it('calls getAllDetails', async () => {
        const request = {} as unknown as Request;
        const response = {} as unknown as Response;

        await handleLoad(request, response);

        expect(getAllDetails).toHaveBeenCalledWith(request, response);
    });
});
