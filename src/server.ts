import config from '@config';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { getDetails, getMissing, getYears, remove, setDetails, setMissing, setName } from '~/server/data';

// TODO add groups: uogienės, dažovienės, šaldyta, pom.padažai, sriubos, dažovės

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ inflate: true }));
app.use(
    cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

app.get('/load', async (req, res) => {
    console.debug(`\nGET /load`);
    res.json({
        years: getYears(),
        details: await getDetails(),
        missing: await getMissing(),
    });
    console.debug(`OK`);
});

app.post('/setMissing', async (req, res) => {
    console.debug(`\nPOST /setMissing`);
    console.debug(JSON.stringify(req.body, null, 2));
    const { missing } = req.body;
    res.json({
        missing: await setMissing(missing),
    });
    console.debug(`OK`);
});

app.post('/setDetails', async (req, res) => {
    console.debug(`\nPOST /setDetails`);
    console.debug(JSON.stringify(req.body, null, 2));
    const { name, details } = req.body;
    res.json({
        years: getYears(),
        details: await setDetails(name, details),
    });
    console.debug(`OK`);
});

app.post('/setName', async (req, res) => {
    console.debug(`\nPOST /setName`);
    console.debug(JSON.stringify(req.body, null, 2));
    const { name, newName } = req.body;
    res.json({
        years: getYears(),
        details: await setName(name, newName),
    });
    console.debug(`OK`);
});

app.post('/remove', async (req, res) => {
    console.debug(`\nPOST /remove`);
    console.debug(JSON.stringify(req.body, null, 2));
    const { name } = req.body;
    res.json({
        years: getYears(),
        details: await remove(name),
    });
    console.debug(`OK`);
});

const PORT = process.env.PORT || config?.api?.port || 3001;
const HOST = process.env.HOST || config?.api?.host || 'localhost';

app.listen(+PORT, HOST, () => {
    console.debug(`Server listening on ${PORT}`);
});
