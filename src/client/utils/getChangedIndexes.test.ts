import { getChangedIndexes } from '~/client/utils/getChangedIndexes';

describe('getChangedIndexes', () => {
    it('returns empty set if no changes were made', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual({});
    });

    it('returns set of changes', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['a', 'c', 'b'])).toEqual({ c: 1, b: 2 });
    });

    it('returns set of more changes', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['c', 'a', 'b'])).toEqual({ c: 0, a: 1, b: 2 });
    });

    it('returns empty set of changes for last element removed', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['a', 'b'])).toEqual({});
    });

    it('returns set of changes for inner element removed', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['a', 'c'])).toEqual({ c: 1 });
    });

    it('returns set of changes for last element added', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['a', 'b', 'c', 'd'])).toEqual({ d: 3 });
    });

    it('returns set of changes for inner element added', () => {
        expect(getChangedIndexes(['a', 'b', 'c'], ['a', 'b', 'd', 'c'])).toEqual({ d: 2, c: 3 });
    });
});
