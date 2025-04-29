/** @jest-environment node */
import { ApiUrl } from '~/common/api';
import app from '~/server/app';
import { handleAdd } from '~/server/app/handleAdd';
import { handleCheckUser } from '~/server/app/handleCheckUser';
import { handleClientId } from '~/server/app/handleClientId';
import { handleDelete } from '~/server/app/handleDelete';
import { handleDeleteGroup } from '~/server/app/handleDeleteGroup';
import { handleDeleteVariant } from '~/server/app/handleDeleteVariant';
import { handleDetails } from '~/server/app/handleDetails';
import { handleMove } from '~/server/app/handleMove';
import { handleRename } from '~/server/app/handleRename';
import { handleRenameGroup } from '~/server/app/handleRenameGroup';
import { handleRenameVariant } from '~/server/app/handleRenameVariant';
import { handleSetMissing } from '~/server/app/handleSetMissing';
import { handleSetRemoving } from '~/server/app/handleSetRemoving';
import { handleSummary } from '~/server/app/handleSummary';
import { handleUpdateDetails } from '~/server/app/handleUpdateDetails';
import { handleUpdateVariant } from '~/server/app/handleUpdateVariant';
import { handleGroups } from './app/handleGroups';
import { handleUpdateGroup } from './app/handleUpdateGroup';
import { handleVariants } from './app/handleVariants';
import express, { type Request, type Response } from 'express';
import request from 'supertest';

// Client/User
jest.mock('~/server/app/handleClientId', () => ({ handleClientId: jest.fn() }));
jest.mock('~/server/app/handleCheckUser', () => ({ handleCheckUser: jest.fn() }));

// Summary
jest.mock('~/server/app/handleSummary', () => ({ handleSummary: jest.fn() }));

// Details
jest.mock('~/server/app/handleAdd', () => ({ handleAdd: jest.fn() }));
jest.mock('~/server/app/handleDetails', () => ({ handleDetails: jest.fn() }));
jest.mock('~/server/app/handleUpdateDetails', () => ({ handleUpdateDetails: jest.fn() }));
jest.mock('~/server/app/handleSetRemoving', () => ({ handleSetRemoving: jest.fn() }));
jest.mock('~/server/app/handleSetMissing', () => ({ handleSetMissing: jest.fn() }));
jest.mock('~/server/app/handleRename', () => ({ handleRename: jest.fn() }));
jest.mock('~/server/app/handleMove', () => ({ handleMove: jest.fn() }));
jest.mock('~/server/app/handleDelete', () => ({ handleDelete: jest.fn() }));

// Groups
jest.mock('~/server/app/handleGroups', () => ({ handleGroups: jest.fn() }));
jest.mock('~/server/app/handleSetGroups', () => ({ handleSetGroups: jest.fn() }));
jest.mock('~/server/app/handleUpdateGroup', () => ({ handleUpdateGroup: jest.fn() }));
jest.mock('~/server/app/handleRenameGroup', () => ({ handleRenameGroup: jest.fn() }));
jest.mock('~/server/app/handleDeleteGroup', () => ({ handleDeleteGroup: jest.fn() }));

// Variants
jest.mock('~/server/app/handleVariants', () => ({ handleVariants: jest.fn() }));
jest.mock('~/server/app/handleSetVariants', () => ({ handleSetVariants: jest.fn() }));
jest.mock('~/server/app/handleUpdateVariant', () => ({ handleUpdateVariant: jest.fn() }));
jest.mock('~/server/app/handleRenameVariant', () => ({ handleRenameVariant: jest.fn() }));
jest.mock('~/server/app/handleDeleteVariant', () => ({ handleDeleteVariant: jest.fn() }));

describe('app', () => {
    const server = app(express());
    const handler = async (_req: Request, res: Response): Promise<void> => void res.json({ ok: true });

    afterEach(() => jest.clearAllMocks());

    describe.each`
        url                          | handle
        ${ApiUrl.ClientId}           | ${handleClientId}
        ${ApiUrl.CheckUser}          | ${handleCheckUser}
        ${ApiUrl.Summary}            | ${handleSummary}
        ${ApiUrl.Details}            | ${handleDetails}
        ${ApiUrl.DetailsUpdate}      | ${handleUpdateDetails}
        ${ApiUrl.DetailsAdd}         | ${handleAdd}
        ${ApiUrl.DetailsSetRemoving} | ${handleSetRemoving}
        ${ApiUrl.DetailsSetMissing}  | ${handleSetMissing}
        ${ApiUrl.DetailsRename}      | ${handleRename}
        ${ApiUrl.DetailsMove}        | ${handleMove}
        ${ApiUrl.DetailsDelete}      | ${handleDelete}
        ${ApiUrl.Groups}             | ${handleGroups}
        ${ApiUrl.GroupsUpdate}       | ${handleUpdateGroup}
        ${ApiUrl.GroupsRename}       | ${handleRenameGroup}
        ${ApiUrl.GroupsDelete}       | ${handleDeleteGroup}
        ${ApiUrl.Variants}           | ${handleVariants}
        ${ApiUrl.VariantsUpdate}     | ${handleUpdateVariant}
        ${ApiUrl.VariantsRename}     | ${handleRenameVariant}
        ${ApiUrl.VariantsDelete}     | ${handleDeleteVariant}
    `('request $url', ({ url, handle }) => {
        jest.mocked(handle).mockImplementation(handler);

        it('responds to POST', async () => {
            const response = await request(server).post(url);

            expect(response.status).toBe(200);
            // eslint-disable-next-line jest/prefer-called-with
            expect(handle).toHaveBeenCalled();
        });

        it('does not respond to GET', async () => {
            const response = await request(server).get(url);

            expect(response.status).toBe(404);
            expect(handle).not.toHaveBeenCalled();
        });
    });

    describe('request /*', () => {
        it('does not respond to GET', async () => {
            const response = await request(server).get('/other');

            expect(response.status).toBe(404);
        });

        it('does not respond to POST', async () => {
            const response = await request(server).post('/other');

            expect(response.status).toBe(404);
        });
    });
});
