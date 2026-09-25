import { mapOrder } from '~/lib/utils/mapOrder';

describe('mapOrder', () => {
    it('maps items to order record', () => {
        const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
        const result = mapOrder(items, (item) => item.id);

        expect(result).toStrictEqual({ a: 0, b: 1, c: 2 });
    });

    it('handles empty array', () => {
        const result = mapOrder([], (item) => item);

        expect(result).toStrictEqual({});
    });

    it('handles single item', () => {
        const items = [{ name: 'test' }];
        const result = mapOrder(items, (item) => item.name);

        expect(result).toStrictEqual({ test: 0 });
    });

    it('uses custom key function', () => {
        const items = [
            { group: 'Uogienės', variant: 'p' },
            { group: 'Uogienės', variant: 'd' },
        ];
        const result = mapOrder(items, (item) => `${item.group}-${item.variant}`);

        expect(result).toStrictEqual({ 'Uogienės-p': 0, 'Uogienės-d': 1 });
    });

    it('preserves order from array', () => {
        const items = ['z', 'a', 'm', 'b'];
        const result = mapOrder(items, (item) => item);

        expect(result).toStrictEqual({ z: 0, a: 1, m: 2, b: 3 });
    });
});
