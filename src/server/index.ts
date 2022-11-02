import { api, google } from '@config';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { getDetails, getMissing, getYears, remove, setDetails, setMissing, setName } from '~/server/data';

// TODO add groups: uogienės, dažovienės, šaldyta, pom.padažai, sriubos, dažovės

(async () => {
    const app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ inflate: true }));
    app.use(
        cors({
            origin: '*',
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: true,
            optionsSuccessStatus: 204,
        })
    );

    app.get('/**/clientId', async (req, res) => {
        console.debug(`\nGET /clientId`);
        console.debug(JSON.stringify(req.body, null, 2));
        res.json({
            clientId: google.clientId,
        });
        console.debug(`OK`);
    });

    app.post('/**/checkUser', async (req, res) => {
        console.debug(`\nGET /checkUser`);
        console.debug(JSON.stringify(req.body, null, 2));
        const { email } = req.body;
        res.json({
            email,
            allowed: google.allowedUsers.includes(email),
        });
        console.debug(`OK`);
    });

    app.get('/**/load', async (req, res) => {
        console.debug(`\nGET /load`);
        res.json({
            years: getYears(),
            details: await getDetails(),
            missing: await getMissing(),
        });
        console.debug(`OK`);
    });

    app.post('/**/setMissing', async (req, res) => {
        console.debug(`\nPOST /setMissing`);
        console.debug(JSON.stringify(req.body, null, 2));
        const { missing } = req.body;
        res.json({
            missing: await setMissing(missing),
        });
        console.debug(`OK`);
    });

    app.post('/**/setDetails', async (req, res) => {
        console.debug(`\nPOST /setDetails`);
        console.debug(JSON.stringify(req.body, null, 2));
        const { name, details } = req.body;
        res.json({
            years: getYears(),
            details: await setDetails(name, details),
        });
        console.debug(`OK`);
    });

    app.post('/**/setName', async (req, res) => {
        console.debug(`\nPOST /setName`);
        console.debug(JSON.stringify(req.body, null, 2));
        const { name, newName } = req.body;
        res.json({
            years: getYears(),
            details: await setName(name, newName),
        });
        console.debug(`OK`);
    });

    app.post('/**/remove', async (req, res) => {
        console.debug(`\nPOST /remove`);
        console.debug(JSON.stringify(req.body, null, 2));
        const { name } = req.body;
        res.json({
            years: getYears(),
            details: await remove(name),
        });
        console.debug(`OK`);
    });

    const url = new URL(process.env.API || api || 'http://localhost:3001');
    const port = +(process.env.PORT || url.port || 3001);
    const host = process.env.HOST || url.hostname || 'localhost';
    app.listen(port, host, () => {
        console.debug(`Server listening on ${host}:${port}`);
    });
})();
