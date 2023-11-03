import nedb from 'nedb-promises';

export const DETAILS = nedb.create();
(async () => await DETAILS.ensureIndex({ fieldName: 'name', unique: true }))();

export const UPDATES = nedb.create();
(async () => {
    await UPDATES.ensureIndex({ fieldName: 'name' });
    await UPDATES.ensureIndex({ fieldName: 'time' });
})();

export const MISSING = nedb.create();

export const REMOVING = nedb.create();
(async () => await REMOVING.ensureIndex({ fieldName: 'name', unique: true }))();

export const compact = async (): Promise<void> => void 0;
