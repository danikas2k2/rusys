import { db } from '~/server/db';

export const $all = async (name: string, projection: object = {}) =>
    (await db())
        .collection(name)
        .find({}, { projection: { _id: 0, ...projection } })
        .toArray();
