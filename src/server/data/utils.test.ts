/** @jest-environment node */
import { getGroupAndNameQuery, getGroupQuery } from '~/server/data/utils';

describe('getGroupQuery', () => {
    it('get query for empty group', () => {
        expect(getGroupQuery('')).toEqual({
            $or: [{ group: 'J' }, { group: { $exists: false } }],
        });
    });

    it('get query for specified group', () => {
        expect(getGroupQuery('G')).toEqual({
            group: 'G',
        });
    });
});

describe('getGroupAndNameQuery', () => {
    it('get query for empty group and name', () => {
        expect(getGroupAndNameQuery('', '')).toEqual({
            $or: [{ group: 'J' }, { group: { $exists: false } }],
            name: '',
        });
    });

    it('get query for empty group and specified name', () => {
        expect(getGroupAndNameQuery('', 'A')).toEqual({
            $or: [{ group: 'J' }, { group: { $exists: false } }],
            name: 'A',
        });
    });

    it('get query for specified group and empty name', () => {
        expect(getGroupAndNameQuery('G', '')).toEqual({
            group: 'G',
            name: '',
        });
    });

    it('get query for specified group and name', () => {
        expect(getGroupAndNameQuery('G', 'A')).toEqual({
            group: 'G',
            name: 'A',
        });
    });
});
