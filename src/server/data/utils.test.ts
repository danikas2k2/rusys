/** @jest-environment node */
import { hasDuplicates, hasEffect } from '~/server/data/utils';
import { MongoError, type DeleteResult, type InsertManyResult, type InsertOneResult, type UpdateResult } from 'mongodb';

describe('hasEffect', () => {
    it('returns true when insertedId is present', () => {
        const result = { insertedId: '123' } as InsertOneResult;

        expect(hasEffect(result)).toBeTrue();
    });

    it('returns false when insertedId is present but has falsy value', () => {
        const result = { insertedId: null } as InsertOneResult;

        expect(hasEffect(result)).toBeFalse();
    });

    it('returns true when insertedCount is present', () => {
        const result = { insertedCount: 1 } as InsertManyResult;

        expect(hasEffect(result)).toBeTrue();
    });

    it('returns false when insertedCount is present but has falsy value', () => {
        const result = { insertedCount: 0 } as InsertManyResult;

        expect(hasEffect(result)).toBeFalse();
    });

    it('returns true when modifiedCount is present', () => {
        const result = { modifiedCount: 1 } as UpdateResult;

        expect(hasEffect(result)).toBeTrue();
    });

    it('returns false when modifiedCount is present but has falsy value', () => {
        const result = { modifiedCount: 0 } as UpdateResult;

        expect(hasEffect(result)).toBeFalse();
    });

    it('returns true when upsertedCount is present', () => {
        const result = { upsertedCount: 1 } as UpdateResult;

        expect(hasEffect(result)).toBeTrue();
    });

    it('returns false when upsertedCount is present but has falsy value', () => {
        const result = { upsertedCount: 0 } as UpdateResult;

        expect(hasEffect(result)).toBeFalse();
    });

    it('returns true when deletedCount is present', () => {
        const result = { deletedCount: 1 } as DeleteResult;

        expect(hasEffect(result)).toBeTrue();
    });

    it('returns false when deletedCount is present but has falsy value', () => {
        const result = { deletedCount: 0 } as DeleteResult;

        expect(hasEffect(result)).toBeFalse();
    });

    it('returns false when no effect fields are present', () => {
        const result = {} as any;

        expect(hasEffect(result)).toBeFalse();
    });
});

describe('hasDuplicates', () => {
    it('returns false when MongoError with code 11000 is thrown', () => {
        const error = new MongoError('Duplicate key error');
        error.code = 11000;

        expect(hasDuplicates(error)).toBeFalse();
    });

    it('returns false when MongoError with different code is thrown', () => {
        const error = new MongoError('Duplicate key error');
        error.code = 11111;

        expect(() => hasDuplicates(error)).toThrow('Duplicate key error');
    });

    it('rethrows error when error is not a MongoError with code 11000', () => {
        const error = new Error('Some error');

        expect(() => hasDuplicates(error)).toThrow('Some error');
    });
});
