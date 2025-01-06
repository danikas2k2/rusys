import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import { getEverything, remove, rename } from '~/server/data/common';
import { getDetails, setDetails, updateDetails } from '~/server/data/details';
import { getMissing, setMissing } from '~/server/data/missing';
import { getRemoving, setRemoving } from '~/server/data/removing';
import { getSummary } from '~/server/data/updates';
import { getYears } from '~/server/data/years';

// TODO add groups: uogienės, daržovienės, šaldyta, daržovės, kruopos, pom.padažai, sriubos

export default function (app = express()): Express {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(cors());

    // eslint-disable-next-line import/no-named-as-default-member
    app.use(express.static('public'));

    const { debug } = console;

    app.get('/clientId', async (req: Request, res: Response) => {
        debug();
        debug('GET /clientId');
        debug(JSON.stringify(req.body, null, 2));
        debug('GOOGLE_CLIENT_ID');
        const clientId = process.env.GOOGLE_CLIENT_ID;
        debug(clientId);
        res.json({
            ok: !!clientId,
            clientId,
        });
        debug(clientId ? 'OK' : "ERROR: GOOGLE_CLIENT_ID doesn't exist");
    });

    app.post('/checkUser', async (req: Request, res: Response) => {
        debug();
        debug('GET /checkUser');
        debug(JSON.stringify(req.body, null, 2));
        debug('GOOGLE_ALLOWED_USERS');
        const allowedUsers = process.env.GOOGLE_ALLOWED_USERS;
        debug(allowedUsers);
        const { email } = req.body;
        res.json({
            ok: true,
            email,
            allowed: allowedUsers?.split(',').includes(email) || process.env.DEV_MODE,
        });
        debug(allowedUsers ? 'OK' : "ERROR: GOOGLE_ALLOWED_USERS doesn't exist");
    });

    async function getAllDetails(req: Request, res: Response): Promise<void> {
        const years = getYears();
        res.json({
            ok: true,
            years,
            details: await getDetails(years),
            removing: await getRemoving(years),
            missing: await getMissing(),
        });
    }

    app.get('/load', async (req: Request, res: Response) => {
        debug();
        debug('GET /load');
        await getAllDetails(req, res);
        debug('OK');
    });

    app.get('/summary', async (req: Request, res: Response) => {
        debug();
        debug('GET /summary');
        const years = getYears();
        res.json({
            ok: true,
            years,
            statistics: await getSummary(years),
        });
        debug('OK');
    });

    app.post('/setMissing', async (req: Request, res: Response) => {
        debug();
        debug('POST /setMissing');
        debug(JSON.stringify(req.body, null, 2));
        const { missing } = req.body;
        res.json({
            ok: true,
            missing: await setMissing(missing),
        });
        debug('OK');
    });

    app.post('/setDetails', async (req: Request, res: Response) => {
        debug();
        debug('POST /setDetails');
        debug(JSON.stringify(req.body, null, 2));
        const { name, details, updateWithoutHistory } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            details: await setDetails(name, details, updateWithoutHistory),
        });
        debug('OK');
    });

    app.post('/updateDetails', async (req: Request, res: Response) => {
        debug();
        debug('POST /updateDetails');
        debug(JSON.stringify(req.body, null, 2));
        const { name, year, value, updateWithoutHistory } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            details: await updateDetails(name, year, value, updateWithoutHistory),
        });
        debug('OK');
    });

    app.post('/setRemoving', async (req: Request, res: Response) => {
        debug();
        debug('POST /setRemoving');
        debug(JSON.stringify(req.body, null, 2));
        const { name, year, removing } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            removing: await setRemoving(name, year, removing),
        });
        debug('OK');
    });

    app.post('/setName', async (req: Request, res: Response) => {
        debug();
        debug('POST /setName');
        debug(JSON.stringify(req.body, null, 2));
        const { name, newName } = req.body;
        await rename(name, newName);
        await getAllDetails(req, res);
        debug('OK');
    });

    app.post('/remove', async (req: Request, res: Response) => {
        debug();
        debug('POST /remove');
        debug(JSON.stringify(req.body, null, 2));
        const { name } = req.body;
        await remove(name);
        await getAllDetails(req, res);
        debug('OK');
    });

    app.get('/export', async (req: Request, res: Response) => {
        debug();
        debug('GET /export');
        res.json({
            ok: true,
            ...(await getEverything()),
        });
        debug('OK');
    });

    return app;
}
