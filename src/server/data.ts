import moment from 'moment';
import nedb from 'nedb-promises';
import path from 'path';
import { Details, Values, Year } from '~/store/details.types';
// import { isEmpty } from 'lodash';
// import { initialDetails } from '../../data/initial-details';

export const db = {
    details: nedb.create({ filename: path.resolve(__dirname, '../../data/details.jsonl'), autoload: true }),
    missing: nedb.create({ filename: path.resolve(__dirname, '../../data/missing.jsonl'), autoload: true }),
};

const MAX_YEARS = 5;
const SWITCH_MONTH = 6;

export function getYears(): Year[] {
    return [...Array(MAX_YEARS)].map(
        (y, i) => +moment().subtract(i, 'years').subtract(SWITCH_MONTH, 'months').format('YY')
    );
}

export async function getDetails(): Promise<Details> {
    const details = await db.details.find<Details>({});
    // if (isEmpty(details)) {
    //     await db.details.insert(Object.entries(initialDetails).map(([k, v]) => ({ _id: k, ...v })));
    //     return initialDetails;
    // }
    return Object.fromEntries(details.map((v) => [v._id, v]));
}

export async function setDetails(name: string, details: Values): Promise<Details> {
    await db.details.update({ _id: name }, { _id: name, ...details });
    await db.details.persistence?.compactDatafile?.();
    return getDetails();
}

export async function getMissing(): Promise<string[]> {
    return ((await db.missing.findOne({})) as any)?.missing || [];
}

export async function setMissing(missing: string[]): Promise<string[]> {
    await db.missing.remove({}, { multi: true });
    await db.missing.insert({ missing });
    await db.missing.persistence?.compactDatafile?.();
    return getMissing();
}
