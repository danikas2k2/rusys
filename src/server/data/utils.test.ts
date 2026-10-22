import { MongoError, type DeleteResult, type InsertManyResult, type InsertOneResult, type UpdateResult } from 'mongodb';

import { SchemaError } from '~/schema';
import { assertSuccess, handleDuplicate, hasEffect } from '~/server/data/utils';

describe('hasEffect', () => {
    it('returns true when insertedId is present', () => {
        const result = { insertedId: '123' } as InsertOneResult;

        expect(hasEffect(result)).toBe(true);
    });

    it('returns false when insertedId is present but has falsy value', () => {
        const result = { insertedId: null } as InsertOneResult;

        expect(hasEffect(result)).toBe(false);
    });

    it('returns true when insertedCount is present', () => {
        const result = { insertedCount: 1 } as InsertManyResult;

        expect(hasEffect(result)).toBe(true);
    });

    it('returns false when insertedCount is present but has falsy value', () => {
        const result = { insertedCount: 0 } as InsertManyResult;

        expect(hasEffect(result)).toBe(false);
    });

    it('returns true when modifiedCount is present', () => {
        const result = { modifiedCount: 1 } as UpdateResult;

        expect(hasEffect(result)).toBe(true);
    });

    it('returns false when modifiedCount is present but has falsy value', () => {
        const result = { modifiedCount: 0 } as UpdateResult;

        expect(hasEffect(result)).toBe(false);
    });

    it('returns true when upsertedCount is present', () => {
        const result = { upsertedCount: 1 } as UpdateResult;

        expect(hasEffect(result)).toBe(true);
    });

    it('returns false when upsertedCount is present but has falsy value', () => {
        const result = { upsertedCount: 0 } as UpdateResult;

        expect(hasEffect(result)).toBe(false);
    });

    it('returns true when deletedCount is present', () => {
        const result = { deletedCount: 1 } as DeleteResult;

        expect(hasEffect(result)).toBe(true);
    });

    it('returns false when deletedCount is present but has falsy value', () => {
        const result = { deletedCount: 0 } as DeleteResult;

        expect(hasEffect(result)).toBe(false);
    });

    it('returns false when no effect fields are present', () => {
        const result = {} as UpdateResult;

        expect(hasEffect(result)).toBe(false);
    });
});

describe('handleDuplicate', () => {
    it('returns the domain callback result only for duplicate key errors', () => {
        const cause = new MongoError('Duplicate key error');
        cause.code = 11000;
        const handle = vi.fn(() => 'duplicate');

        expect(handleDuplicate(cause, handle)).toBe('duplicate');
        expect(handle).toHaveBeenCalledExactlyOnceWith();
    });

    it('propagates the domain error thrown by the duplicate callback', () => {
        const cause = new MongoError('Duplicate key error');
        cause.code = 11000;
        const domainError = new Error(SchemaError.NameAlreadyExists);

        expect(() =>
            handleDuplicate(cause, () => {
                throw domainError;
            })
        ).toThrow(domainError);
    });

    it('rethrows Mongo errors with other codes without invoking the callback', () => {
        const cause = new MongoError('Database error');
        cause.code = 11111;
        const handle = vi.fn();

        expect(() => handleDuplicate(cause, handle)).toThrow(cause);
        expect(handle).not.toHaveBeenCalled();
    });

    it('rethrows non-Mongo errors without invoking the callback', () => {
        const cause = new Error('Some error');
        const handle = vi.fn();

        expect(() => handleDuplicate(cause, handle)).toThrow(cause);
        expect(handle).not.toHaveBeenCalled();
    });
});

describe('assertSuccess', () => {
    it('resolves when the operation has an effect', async () => {
        await expect(assertSuccess(true)).resolves.toBeUndefined();
    });

    it('rejects with the shared request failure message when there is no effect', async () => {
        await expect(assertSuccess(false)).rejects.toThrow(SchemaError.RequestFailed);
    });
});
