import config from '@config';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import moment from 'moment';
import nedb from 'nedb-promises';
import { Details, Values, Year } from '~/types';
// import isEmpty from 'is-empty';
// import { initialDetails } from '../data/initial-details';

// TODO add groups: uogienės, dažovienės, šaldyta, pom.padažai, sriubos, dažovės

const db = {
    details: nedb.create({ filename: './data/details.jsonl', autoload: true }),
    missing: nedb.create({ filename: './data/missing.jsonl', autoload: true }),
};

const MAX_YEARS = 5;
const SWITCH_MONTH = 6;

function getYears(): Year[] {
    return [...Array(MAX_YEARS)].map(
        (y, i) => +moment().subtract(i, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}

async function getDetails(): Promise<Details> {
    const details = await db.details.find<Details>({});
    // if (isEmpty(details)) {
    //     await db.details.insert(Object.entries(initialDetails).map(([k, v]) => ({ _id: k, ...v })));
    //     return initialDetails;
    // }
    return Object.fromEntries(details.map((v) => [v._id, v]));
}

async function setDetails(name: string, details: Values): Promise<Details> {
    await db.details.update({ _id: name }, { _id: name, ...details });
    await db.details.persistence?.compactDatafile?.();
    return getDetails();
}

async function getMissing(): Promise<string[]> {
    return ((await db.missing.findOne({})) as any)?.missing || [];
}

async function setMissing(missing: string[]): Promise<string[]> {
    await db.missing.remove({}, { multi: true });
    await db.missing.insert({ missing });
    await db.missing.persistence?.compactDatafile?.();
    return getMissing();
}

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
    res.json({
        years: getYears(),
        details: await getDetails(),
        missing: await getMissing(),
    });
});

app.post('/setMissing', async (req, res) => {
    const { missing } = req.body;
    res.json({
        missing: await setMissing(missing),
    });
});

app.post('/setDetails', async (req, res) => {
    const { name, details } = req.body;
    res.json({
        years: getYears(),
        details: await setDetails(name, details),
    });
});

const PORT = process.env.PORT || config?.api?.port || 3001;
const HOST = process.env.HOST || config?.api?.host || 'localhost';

app.listen(+PORT, HOST, () => {
    console.info(`Server listening on ${PORT}`);
});
