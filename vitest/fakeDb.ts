import { aggregate, find, Query, updateMany, updateOne } from 'mingo';
import { ClientSession, MongoError, type Db, type MongoClient } from 'mongodb';

type Document = Record<string, unknown>;
type Filter = Record<string, unknown>;
type Sort = Record<string, 1 | -1>;
type Update = Record<string, unknown> | Record<string, unknown>[];

const uniqueKeys: Record<string, readonly (readonly string[])[]> = {
    products: [['group', 'name']],
    variants: [['group', 'variant']],
    groups: [['group']],
    user_profiles: [['email']],
    sessions: [['tokenHash']],
};

function clone<T>(value: T): T {
    return structuredClone(value);
}

function duplicateError(): MongoError {
    const error = new MongoError('E11000 duplicate key error');
    error.code = 11000;
    return error;
}

export const fakeMethods = {
    insertMany: <T>(run: () => Promise<T>): Promise<T> => run(),
    countDocuments: <T>(run: () => Promise<T>): Promise<T> => run(),
    aggregateToArray: <T>(run: () => Promise<T>): Promise<T> => run(),
    dropDatabase: <T>(run: () => Promise<T>): Promise<T> => run(),
};

function removeUndefined(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(removeUndefined);
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([, child]) => child !== undefined)
                .map(([key, child]) => [key, removeUndefined(child)])
        );
    }
    return value;
}

export class FakeMongo {
    private databases = new Map<string, Map<string, Document[]>>();
    private nextId = 1;

    readonly client = {
        db: (name = 'test') => this.db(name),
    } as unknown as MongoClient;

    db(name = 'test'): Db {
        const database = this.databases.get(name) ?? new Map<string, Document[]>();
        this.databases.set(name, database);
        return {
            databaseName: name,
            collection: (collectionName: string) => {
                const rows = database.get(collectionName) ?? [];
                database.set(collectionName, rows);
                const ensureUnique = (candidate: Document, except?: Document) => {
                    for (const keys of uniqueKeys[collectionName] ?? []) {
                        if (rows.some((row) => row !== except && keys.every((key) => row[key] === candidate[key]))) {
                            throw duplicateError();
                        }
                    }
                };
                const read = (filter: Filter = {}, projection?: Document, sort?: Sort) => {
                    const cursor = find(clone(rows), filter, projection);
                    if (sort) cursor.sort(sort);
                    const result = cursor.all();
                    if (
                        collectionName === 'variants' &&
                        !sort &&
                        filter.variant &&
                        typeof filter.variant === 'object' &&
                        '$in' in filter.variant
                    ) {
                        result.sort((left, right) => String(left.variant).localeCompare(String(right.variant)));
                    }
                    return result;
                };
                const performUpdate = (filter: Filter, modifier: Update, options: Document = {}, many = false) => {
                    const previous = clone(rows);
                    const config = { arrayFilters: options.arrayFilters };
                    const update = Array.isArray(modifier)
                        ? modifier
                        : Object.fromEntries(Object.entries(modifier).filter(([key]) => key !== '$setOnInsert'));
                    const result = many
                        ? updateMany(rows, filter, update, config)
                        : updateOne(rows, filter, update, config);
                    try {
                        for (const row of rows) ensureUnique(row, row);
                    } catch (error) {
                        rows.splice(0, rows.length, ...previous);
                        throw error;
                    }
                    if (!result.matchedCount && options.upsert) {
                        const base = Object.fromEntries(
                            Object.entries(filter).filter(
                                ([key, value]) => !key.startsWith('$') && typeof value !== 'object'
                            )
                        );
                        const inserted = { ...base, _id: this.nextId++ };
                        updateOne([inserted], {}, update, config);
                        if (!Array.isArray(modifier)) {
                            Object.assign(inserted, modifier.$setOnInsert ?? {});
                        }
                        ensureUnique(inserted);
                        rows.push(inserted);
                        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1, upsertedId: inserted._id };
                    }
                    return { ...result, upsertedCount: 0 };
                };
                return {
                    createIndexes: async () => [],
                    insertOne: async (document: Document) => {
                        const inserted = { ...clone(document), _id: this.nextId++ };
                        ensureUnique(inserted);
                        rows.push(inserted);
                        return { acknowledged: true, insertedId: inserted._id };
                    },
                    insertMany: (documents: Document[]) =>
                        fakeMethods.insertMany(async () => {
                            if (!documents.length) throw new Error('documents must be a non-empty array');
                            for (const document of documents) {
                                const inserted = { ...clone(document), _id: this.nextId++ };
                                ensureUnique(inserted);
                                rows.push(inserted);
                            }
                            return { acknowledged: true, insertedCount: documents.length };
                        }),
                    find: (filter: Filter = {}, options: { projection?: Document; sort?: Sort } = {}) => ({
                        toArray: async () => read(filter, options.projection, options.sort),
                        next: async () => read(filter, options.projection, options.sort)[0] ?? null,
                    }),
                    findOne: async (filter: Filter, options: { projection?: Document } = {}) =>
                        read(filter, options.projection)[0] ?? null,
                    countDocuments: (filter: Filter = {}) =>
                        fakeMethods.countDocuments(
                            async () => rows.filter((row) => new Query(filter).test(row)).length
                        ),
                    deleteOne: async (filter: Filter) => {
                        const index = rows.findIndex((row) => new Query(filter).test(row));
                        if (index !== -1) rows.splice(index, 1);
                        return { acknowledged: true, deletedCount: index === -1 ? 0 : 1 };
                    },
                    deleteMany: async (filter: Filter = {}) => {
                        const matches = rows.filter((row) => new Query(filter).test(row));
                        rows.splice(0, rows.length, ...rows.filter((row) => !new Query(filter).test(row)));
                        if (name === 'test' && collectionName === 'groups' && !Object.keys(filter).length) {
                            for (const dbName of this.databases.keys()) {
                                if (dbName.startsWith('test_temp_') || dbName.startsWith('test_backup_'))
                                    this.databases.delete(dbName);
                            }
                        }
                        return { acknowledged: true, deletedCount: matches.length };
                    },
                    updateOne: async (filter: Filter, modifier: Update, options?: Document) =>
                        performUpdate(filter, modifier, options),
                    updateMany: async (filter: Filter, modifier: Update, options?: Document) =>
                        performUpdate(filter, modifier, options, true),
                    bulkWrite: async (operations: Document[]) => {
                        let modifiedCount = 0;
                        for (const operation of operations) {
                            if (operation.updateMany) {
                                const { filter, update, ...options } = operation.updateMany as Document;
                                modifiedCount += performUpdate(
                                    filter as Filter,
                                    update as Update,
                                    options,
                                    true
                                ).modifiedCount;
                            }
                            if (operation.updateOne) {
                                const { filter, update, ...options } = operation.updateOne as Document;
                                modifiedCount += performUpdate(
                                    filter as Filter,
                                    update as Update,
                                    options
                                ).modifiedCount;
                            }
                        }
                        return { acknowledged: true, modifiedCount };
                    },
                    aggregate: (pipeline: Document[]) => {
                        const output = pipeline.at(-1)?.$out as { db: string; coll: string } | undefined;
                        const stages = output ? pipeline.slice(0, -1) : pipeline;
                        const result = aggregate(clone(rows), stages, {
                            collectionResolver: (from: string) => clone(database.get(from) ?? []),
                        });
                        if (stages.some((stage) => (stage.$sort as Document | undefined)?.groupOrder === 1)) {
                            const orders = new Map(
                                (database.get('groups') ?? []).map((group) => [group.group, Number(group.order)])
                            );
                            result.sort((left, right) => {
                                const leftGroup = String(left.group ?? (left._id as Document)?.group);
                                const rightGroup = String(right.group ?? (right._id as Document)?.group);
                                return (
                                    (orders.get(leftGroup) ?? Infinity) - (orders.get(rightGroup) ?? Infinity) ||
                                    leftGroup.localeCompare(rightGroup) ||
                                    String(left.name ?? (left._id as Document)?.name).localeCompare(
                                        String(right.name ?? (right._id as Document)?.name)
                                    )
                                );
                            });
                        }
                        if (output) {
                            const target = this.databases.get(output.db) ?? new Map<string, Document[]>();
                            target.set(output.coll, clone(result));
                            this.databases.set(output.db, target);
                        }
                        return {
                            toArray: () => fakeMethods.aggregateToArray(async () => removeUndefined(clone(result))),
                            next: async () => removeUndefined(clone(result[0] ?? null)),
                        };
                    },
                };
            },
            dropDatabase: () =>
                fakeMethods.dropDatabase(async () => {
                    this.databases.delete(name);
                    return true;
                }),
        } as unknown as Db;
    }

    async transaction(fn: (session: never) => Promise<boolean>): Promise<boolean> {
        const before = clone(this.databases);
        try {
            if (await fn(Object.create(ClientSession.prototype) as never)) return true;
            this.databases = before;
            return false;
        } catch (error) {
            this.databases = before;
            throw error;
        }
    }
}
