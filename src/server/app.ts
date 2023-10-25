import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import { getDetails, getMissing, getRemoving, getYears, remove, setDetails, setMissing, setName, setRemoving, updateDetails } from '~/server/data';

// TODO add groups: uogienės, daržovienės, šaldyta, daržovės, kruopos, pom.padažai, sriubos

export default function (app = express()): Express {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(cors());
    app.use(express.static('public'));

    const { debug } = console;

    app.get('/clientId', async (req: Request, res: Response) => {
        debug();
        debug('GET /clientId');
        debug(JSON.stringify(req.body, null, 2));
        debug('GOOGLE_CLIENT_ID');
        const clientId = process.env.GOOGLE_CLIENT_ID;
        debug(clientId);
        setTimeout(async () => {
            res.json({
                ok: !!clientId,
                clientId,
            });
            debug(clientId ? 'OK' : "ERROR: GOOGLE_CLIENT_ID doesn't exist");
        }, 3000);
    });

    app.post('/checkUser', async (req: Request, res: Response) => {
        debug();
        debug('GET /checkUser');
        debug(JSON.stringify(req.body, null, 2));
        debug('GOOGLE_ALLOWED_USERS');
        const allowedUsers = process.env.GOOGLE_ALLOWED_USERS;
        debug(allowedUsers);
        const { email } = req.body;
        setTimeout(async () => {
            res.json({
                ok: true,
                email,
                allowed: allowedUsers?.split(',').includes(email) || process.env.DEV_MODE,
            });
            debug(allowedUsers ? 'OK' : "ERROR: GOOGLE_ALLOWED_USERS doesn't exist");
        }, 3000);
    });

    async function getAllDetails(req: Request, res: Response): Promise<void> {
        const years = getYears();
        setTimeout(async () => {
            res.json({
                ok: true,
                years,
                details: await getDetails(years),
                removing: await getRemoving(years),
                missing: await getMissing(),
            });
        }, 3000);
    }

    app.get('/load', async (req: Request, res: Response) => {
        debug();
        debug('GET /load');
        setTimeout(async () => {
            await getAllDetails(req, res);
            debug('OK');
        }, 3000);
    });

    app.post('/setMissing', async (req: Request, res: Response) => {
        debug();
        debug('POST /setMissing');
        debug(JSON.stringify(req.body, null, 2));
        const { missing } = req.body;
        setTimeout(async () => {
            res.json({
                ok: true,
                missing: await setMissing(missing),
            });
            debug('OK');
        }, 3000);
    });

    app.post('/setDetails', async (req: Request, res: Response) => {
        debug();
        debug('POST /setDetails');
        debug(JSON.stringify(req.body, null, 2));
        const { name, details } = req.body;
        setTimeout(async () => {
            res.json({
                ok: true,
                years: getYears(),
                details: await setDetails(name, details),
            });
            debug('OK');
        }, 3000);
    });

    app.post('/updateDetails', async (req: Request, res: Response) => {
        debug();
        debug('POST /updateDetails');
        debug(JSON.stringify(req.body, null, 2));
        const { name, year, value } = req.body;
        setTimeout(async () => {
            res.json({
                ok: true,
                years: getYears(),
                details: await updateDetails(name, year, value),
            });
            debug('OK');
        }, 3000);
    });

    app.post('/setRemoving', async (req: Request, res: Response) => {
        debug();
        debug('POST /setRemoving');
        debug(JSON.stringify(req.body, null, 2));
        const { name, year, removing } = req.body;
        setTimeout(async () => {
            res.json({
                ok: true,
                years: getYears(),
                removing: await setRemoving(name, year, removing),
            });
            debug('OK');
        }, 3000);
    });

    app.post('/setName', async (req: Request, res: Response) => {
        debug();
        debug('POST /setName');
        debug(JSON.stringify(req.body, null, 2));
        const { name, newName } = req.body;
        setTimeout(async () => {
            await setName(name, newName);
            await getAllDetails(req, res);
            debug('OK');
        }, 3000);
    });

    app.post('/remove', async (req: Request, res: Response) => {
        debug();
        debug('POST /remove');
        debug(JSON.stringify(req.body, null, 2));
        const { name } = req.body;
        setTimeout(async () => {
            await remove(name);
            await getAllDetails(req, res);
            debug('OK');
        }, 3000);
    });

    return app;
}
