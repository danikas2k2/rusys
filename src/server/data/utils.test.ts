import { getNamedMap } from '~/server/data/utils';

describe('getNamedMap', () => {
    it('group single element', () => {
        expect(getNamedMap([{ name: 'A', 21: { '': 2 } }])).toEqual({
            A: { 21: { '': 2 } },
        });
    });

    it('group multiple elements', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 20: { '': 1 } },
            ])
        ).toEqual({
            A: { 21: { '': 2 } },
            B: { 20: { '': 1 } },
        });
    });

    it('group multiple elements with same name', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'A', 20: { '': 1 } },
            ])
        ).toEqual({
            A: { 21: { '': 2 }, 20: { '': 1 } },
        });
    });

    it('group multiple elements with same name and year', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'A', 21: { d: 1 } },
            ])
        ).toEqual({
            A: { 21: { '': 2, d: 1 } },
        });
    });

    it('group multiple elements with same name, year, and variant', () => {
        expect(
            getNamedMap([
                { name: 'A', 21: { '': 2 } },
                { name: 'A', 21: { '': 1 } },
            ])
        ).toEqual({
            A: { 21: { '': 1 } },
        });
    });
});
