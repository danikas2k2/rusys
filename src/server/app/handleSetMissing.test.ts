import { type Request, type Response } from 'express';
import { handleSetMissing } from '~/server/app/handleSetMissing';
import { getMissing, setMissing } from '~/server/data/missing';
import { type Missing } from '~/state/missing/types';

jest.mock('~/server/db');
jest.mock('~/server/app/debug');
jest.mock('~/server/data/missing');

describe('handleSetMissing', () => {
    const missing: Missing = [
        { group: '', name: 'A' },
        { group: '', name: 'B' },
        { group: '', name: 'C' },
        { group: 'G', name: 'A' },
    ];

    const request = { body: { missing } } as unknown as Request;
    const response = { json: jest.fn() } as unknown as Response;

    afterEach(() => jest.clearAllMocks());

    it('calls setMissing and responds with json when setMissing is successful', async () => {
        (setMissing as jest.Mock).mockResolvedValue(true);
        (getMissing as jest.Mock).mockResolvedValue(missing);
        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith(missing);
        expect(getMissing).toHaveBeenCalled();
        expect(response.json).toHaveBeenCalledWith({ ok: true, missing });
    });

    it('calls setMissing and responds with json when setMissing is not successful', async () => {
        (setMissing as jest.Mock).mockResolvedValue(false);
        await handleSetMissing(request, response);

        expect(setMissing).toHaveBeenCalledWith(missing);
        expect(response.json).toHaveBeenCalledWith({ ok: false });
    });
});
