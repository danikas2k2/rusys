/** @jest-environment node */
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { ApiUrl } from '~/common/api';
import app from '~/server/app';
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
import { handleUpdateDetailsVariants } from '~/server/app/handleUpdateDetailsVariants';
import { handleUpdateDetailsYears } from '~/server/app/handleUpdateDetailsYears';
import { handleUpdateVariant } from '~/server/app/handleUpdateVariant';
import { handleGroups } from './app/handleGroups';
import { handleUpdateGroup } from './app/handleUpdateGroup';
import { handleVariants } from './app/handleVariants';

// Client/User
jest.mock('~/server/app/handleClientId', () => ({ handleClientId: jest.fn() }));
jest.mock('~/server/app/handleCheckUser', () => ({ handleCheckUser: jest.fn() }));

// Summary
jest.mock('~/server/app/handleSummary', () => ({ handleSummary: jest.fn() }));

// Details
jest.mock('~/server/app/handleDetails', () => ({ handleDetails: jest.fn() }));
jest.mock('~/server/app/handleUpdateDetailsYears', () => ({ handleUpdateDetailsYears: jest.fn() }));
jest.mock('~/server/app/handleUpdateDetailsVariants', () => ({ handleUpdateDetailsVariants: jest.fn() }));
jest.mock('~/server/app/handleSetRemoving', () => ({ handleSetRemoving: jest.fn() }));
jest.mock('~/server/app/handleSetMissing', () => ({ handleSetMissing: jest.fn() }));
jest.mock('~/server/app/handleRename', () => ({ handleRename: jest.fn() }));
jest.mock('~/server/app/handleMove', () => ({ handleMove: jest.fn() }));
jest.mock('~/server/app/handleDelete', () => ({ handleDelete: jest.fn() }));
jest.mock('~/server/app/handleDetails', () => ({ handleDetails: jest.fn() }));

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
    const handler = (_req: Request, res: Response): Response => res.json({ ok: true });

    afterEach(() => jest.clearAllMocks());

    // Client/User
    describe('Client/User', () => {
        describe('request /clientId', () => {
            (handleClientId as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.ClientId);
                expect(response.status).toBe(200);
                expect(handleClientId).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.ClientId);
                expect(response.status).toBe(404);
                expect(handleClientId).not.toHaveBeenCalled();
            });
        });

        describe('request /checkUser', () => {
            (handleCheckUser as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.CheckUser);
                expect(response.status).toBe(200);
                expect(handleCheckUser).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.CheckUser);
                expect(response.status).toBe(404);
                expect(handleCheckUser).not.toHaveBeenCalled();
            });
        });
    });

    // Summary
    describe('Summary', () => {
        describe('request /summary', () => {
            (handleSummary as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.Summary);
                expect(response.status).toBe(200);
                expect(handleSummary).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.Summary);
                expect(response.status).toBe(404);
                expect(handleSummary).not.toHaveBeenCalled();
            });
        });
    });

    // Details
    describe('Details', () => {
        describe('request /details', () => {
            (handleDetails as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.Details);
                expect(response.status).toBe(200);
                expect(handleDetails).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.Details);
                expect(response.status).toBe(404);
                expect(handleDetails).not.toHaveBeenCalled();
            });
        });

        describe('request /details/update', () => {
            it('does not respond to POST', async () => {
                const response = await request(server).post('/details/update');
                expect(response.status).toBe(404);
                expect(handleUpdateDetailsYears).not.toHaveBeenCalled();
                expect(handleUpdateDetailsVariants).not.toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get('/details/update');
                expect(response.status).toBe(404);
                expect(handleUpdateDetailsYears).not.toHaveBeenCalled();
                expect(handleUpdateDetailsVariants).not.toHaveBeenCalled();
            });
        });

        describe('request /details/years', () => {
            (handleUpdateDetailsYears as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsSetYears);
                expect(response.status).toBe(200);
                expect(handleUpdateDetailsYears).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsSetYears);
                expect(response.status).toBe(404);
                expect(handleUpdateDetailsYears).not.toHaveBeenCalled();
            });
        });

        describe('request /details/varia', () => {
            (handleUpdateDetailsVariants as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsSetAmounts);
                expect(response.status).toBe(200);
                expect(handleUpdateDetailsVariants).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsSetAmounts);
                expect(response.status).toBe(404);
                expect(handleUpdateDetailsVariants).not.toHaveBeenCalled();
            });
        });

        describe('request /details/removing', () => {
            (handleSetRemoving as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsSetRemoving);
                expect(response.status).toBe(200);
                expect(handleSetRemoving).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsSetRemoving);
                expect(response.status).toBe(404);
                expect(handleSetRemoving).not.toHaveBeenCalled();
            });
        });

        describe('request /details/missing', () => {
            (handleSetMissing as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsSetMissing);
                expect(response.status).toBe(200);
                expect(handleSetMissing).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsSetMissing);
                expect(response.status).toBe(404);
                expect(handleSetMissing).not.toHaveBeenCalled();
            });
        });

        describe('request /details/rename', () => {
            (handleRename as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsRename);
                expect(response.status).toBe(200);
                expect(handleRename).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsRename);
                expect(response.status).toBe(404);
                expect(handleRename).not.toHaveBeenCalled();
            });
        });

        describe('request /details/move', () => {
            (handleMove as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsMove);
                expect(response.status).toBe(200);
                expect(handleMove).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsMove);
                expect(response.status).toBe(404);
                expect(handleMove).not.toHaveBeenCalled();
            });
        });

        describe('request /details/delete', () => {
            (handleDelete as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.DetailsDelete);
                expect(response.status).toBe(200);
                expect(handleDelete).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.DetailsDelete);
                expect(response.status).toBe(404);
                expect(handleDelete).not.toHaveBeenCalled();
            });
        });
    });

    // Groups
    describe('Groups', () => {
        describe('request /groups', () => {
            (handleGroups as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.Groups);
                expect(response.status).toBe(200);
                expect(handleGroups).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.Groups);
                expect(response.status).toBe(404);
                expect(handleGroups).not.toHaveBeenCalled();
            });
        });

        describe('request /groups/update', () => {
            (handleUpdateGroup as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.GroupsUpdate);
                expect(response.status).toBe(200);
                expect(handleUpdateGroup).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.GroupsUpdate);
                expect(response.status).toBe(404);
                expect(handleUpdateGroup).not.toHaveBeenCalled();
            });
        });

        describe('request /groups/rename', () => {
            (handleRenameGroup as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.GroupsRename);
                expect(response.status).toBe(200);
                expect(handleRenameGroup).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.GroupsRename);
                expect(response.status).toBe(404);
                expect(handleRenameGroup).not.toHaveBeenCalled();
            });
        });

        describe('request /groups/delete', () => {
            (handleDeleteGroup as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.GroupsDelete);
                expect(response.status).toBe(200);
                expect(handleDeleteGroup).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.GroupsDelete);
                expect(response.status).toBe(404);
                expect(handleDeleteGroup).not.toHaveBeenCalled();
            });
        });
    });

    // Variants
    describe('Variants', () => {
        describe('request /variants', () => {
            (handleVariants as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.Variants);
                expect(response.status).toBe(200);
                expect(handleVariants).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.Variants);
                expect(response.status).toBe(404);
                expect(handleVariants).not.toHaveBeenCalled();
            });
        });

        describe('request /variants/update', () => {
            (handleUpdateVariant as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.VariantsUpdate);
                expect(response.status).toBe(200);
                expect(handleUpdateVariant).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.VariantsUpdate);
                expect(response.status).toBe(404);
                expect(handleUpdateVariant).not.toHaveBeenCalled();
            });
        });

        describe('request /variants/rename', () => {
            (handleRenameVariant as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.VariantsRename);
                expect(response.status).toBe(200);
                expect(handleRenameVariant).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.VariantsRename);
                expect(response.status).toBe(404);
                expect(handleRenameVariant).not.toHaveBeenCalled();
            });
        });

        describe('request /variants/delete', () => {
            (handleDeleteVariant as jest.Mock).mockImplementation(handler);

            it('responds to POST', async () => {
                const response = await request(server).post(ApiUrl.VariantsDelete);
                expect(response.status).toBe(200);
                expect(handleDeleteVariant).toHaveBeenCalled();
            });

            it('does not respond to GET', async () => {
                const response = await request(server).get(ApiUrl.VariantsDelete);
                expect(response.status).toBe(404);
                expect(handleDeleteVariant).not.toHaveBeenCalled();
            });
        });
    });

    // Other

    describe('Other', () => {
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
});
