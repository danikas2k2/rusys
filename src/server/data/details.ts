import { addUpdate, addUpdates } from '~/server/data/updates';
import { getNamedMap } from '~/server/data/utils';
import { getYears } from '~/server/data/years';
import { compact, DETAILS } from '~/server/db';
import { type Amount, type Amounts, type AmountSet, type NamedAmounts } from '~/store/details/types';
import { type Name, type Year } from '~/store/types';

export async function getDetails(years: number[]): Promise<AmountSet> {
    return getNamedMap(
        await DETAILS.find<NamedAmounts>({}, { _id: 0, name: 1, ...Object.fromEntries(years.map((y) => [y, 1])) }).sort(
            { name: 1 }
        )
    );
}

export async function setDetails(name: Name, values: Amounts, updateWithoutHistory = false): Promise<AmountSet> {
    if (!updateWithoutHistory) {
        await addUpdates(name, values);
    }
    const updated = await DETAILS.update({ name }, { name, ...values }, { upsert: true });
    if (updated) {
        await compact(DETAILS);
    }
    return getDetails(getYears());
}

export async function updateDetails(
    name: Name,
    year: Year,
    value: Amount,
    updateWithoutHistory = false
): Promise<AmountSet> {
    if (!updateWithoutHistory) {
        await addUpdate(name, year, value);
    }
    const updated = await DETAILS.update(
        { name },
        { [Object.keys(value).length ? '$set' : '$unset']: { [year]: value } },
        { upsert: true }
    );
    if (updated) {
        await compact(DETAILS);
    }
    return getDetails(getYears());
}

export async function renameDetails(name: Name, newName: Name): Promise<boolean> {
    const updated = await DETAILS.update({ name }, { $set: { name: newName } }, { multi: true });
    if (updated) {
        await compact(DETAILS);
        return true;
    }
    return false;
}

export async function removeDetails(name: Name): Promise<boolean> {
    const removed = await DETAILS.remove({ name }, { multi: true });
    if (removed) {
        await compact(DETAILS);
        return true;
    }
    return false;
}
