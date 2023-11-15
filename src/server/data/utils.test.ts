import { getGroupAndNameQuery, getGroupQuery, getNamedMap } from '~/server/data/utils';

describe('getNamedMap', () => {
    it('group single element without group', () => {
        expect(getNamedMap([{ name: 'A', 21: { '': 2 } }])).toEqual({
            '': { A: { 21: { '': 2 } } },
        });
    });

    it('group single element with group', () => {
        expect(getNamedMap([{ group: 'G', name: 'A', 21: { '': 2 } }])).toEqual({
            G: { A: { 21: { '': 2 } } },
        });
    });

    it('group multiple elements without groups', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 20: { '': 1 } },
            ])
        ).toEqual({
            '': { A: { 21: { '': 2 } }, B: { 20: { '': 1 } } },
        });
    });

    it('group multiple elements with same group', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'G', name: 'B', 20: { '': 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2 } }, B: { 20: { '': 1 } } },
        });
    });

    it('group multiple elements with different groups', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'H', name: 'B', 20: { '': 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2 } } },
            H: { B: { 20: { '': 1 } } },
        });
    });

    it('group multiple elements with same name without group', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'A', 20: { '': 1 } },
            ])
        ).toEqual({
            '': { A: { 21: { '': 2 }, 20: { '': 1 } } },
        });
    });

    it('group multiple elements with same name and group', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'G', name: 'A', 20: { '': 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2 }, 20: { '': 1 } } },
        });
    });

    it('group multiple elements with same name but different groups', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'H', name: 'A', 20: { '': 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2 } } },
            H: { A: { 20: { '': 1 } } },
        });
    });

    it('group multiple elements with same name and year without group', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'A', 21: { d: 1 } },
            ])
        ).toEqual({
            '': { A: { 21: { '': 2, d: 1 } } },
        });
    });

    it('group multiple elements with same name, group, and year', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'G', name: 'A', 21: { d: 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2, d: 1 } } },
        });
    });

    it('group multiple elements with same name and year but different groups', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'H', name: 'A', 21: { d: 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2 } } },
            H: { A: { 21: { d: 1 } } },
        });
    });

    it('group multiple elements with same name, year, and variant without group', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'A', 21: { '': 1 } },
            ])
        ).toEqual({
            '': { A: { 21: { '': 1 } } },
        });
    });

    it('group multiple elements with same group, name, year, and variant', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'G', name: 'A', 21: { '': 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 1 } } },
        });
    });

    it('group multiple elements with same name, year, and variant but different groups', () => {
        expect(
            getNamedMap([
                { group: 'G', name: 'A', 21: { '': 2 } },
                { group: 'H', name: 'A', 21: { '': 1 } },
            ])
        ).toEqual({
            G: { A: { 21: { '': 2 } } },
            H: { A: { 21: { '': 1 } } },
        });
    });
});

describe('getGroupQuery', () => {
    it('get query for empty group', () => {
        expect(getGroupQuery('')).toEqual({
            $or: [{ group: '' }, { group: { $exists: false } }],
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
            $or: [{ group: '' }, { group: { $exists: false } }],
            name: '',
        });
    });

    it('get query for empty group and specified name', () => {
        expect(getGroupAndNameQuery('', 'A')).toEqual({
            $or: [{ group: '' }, { group: { $exists: false } }],
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
