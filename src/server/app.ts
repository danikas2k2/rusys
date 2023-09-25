import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { getDetails, getMissing, getYears, remove, setDetails, setMissing, setName, updateDetails } from '~/server/data';

// TODO add groups: uogienės, daržovienės, šaldyta, daržovės, kruopos, pom.padažai, sriubos

export default function (app = express()) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(cors());

    console.info('process.cwd', process.cwd());

    app.use(express.static('public'));

    const { debug } = console;

    app.get('/clientId', async (req: Request, res: Response) => {
        debug();
        debug('GET /clientId');
        debug(JSON.stringify(req.body, null, 2));
        debug('GOOGLE_CLIENT_ID');
        const clientId = process.env.GOOGLE_CLIENT_ID || process.env.DEV_MODE && 'FORCE_DEV_MODE';
        debug(clientId);
        res.json({
            ok: true,
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

    app.get('/load', async (req: Request, res: Response) => {
        debug();
        debug('GET /load');
        const years = getYears();
        res.json({
            ok: true,
            years,
            details: await getDetails(years),
            missing: await getMissing(),
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
        const { name, details } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            details: await setDetails(name, details),
        });
        debug('OK');
    });

    app.post('/updateDetails', async (req: Request, res: Response) => {
        debug();
        debug('POST /updateDetails');
        debug(JSON.stringify(req.body, null, 2));
        const { name, year, value } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            details: await updateDetails(name, year, value),
        });
        debug('OK');
    });

    app.post('/setName', async (req: Request, res: Response) => {
        debug();
        debug('POST /setName');
        debug(JSON.stringify(req.body, null, 2));
        const { name, newName } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            details: await setName(name, newName),
        });
        debug('OK');
    });

    app.post('/remove', async (req: Request, res: Response) => {
        debug();
        debug('POST /remove');
        debug(JSON.stringify(req.body, null, 2));
        const { name } = req.body;
        res.json({
            ok: true,
            years: getYears(),
            details: await remove(name),
        });
        debug('OK');
    });

    return app;
}
