import { Links } from '~/lib/links';
import { productSchema } from '~/schema';
import { createScenarioData } from '~/tests/fixtures/data';
import { getVisualAppData } from '~/tests/fixtures/visualData';

describe('visual product fixtures', () => {
    it('preserves valid history updates and sorts products', () => {
        const { data } = getVisualAppData(Links.PRODUCTS, 'history');
        const products = data.products ?? [];
        const expected = createScenarioData('history').products.find(({ name }) => name === 'Avietės');

        expect(products.map(({ name }) => name)).toStrictEqual(['Morkos', 'Avietės', 'Braškės']);
        expect(products.find(({ name }) => name === 'Avietės')?.updates).toStrictEqual(expected?.updates);
        expect(products.find(({ name }) => name === 'Avietės')?.historyYears).toStrictEqual([
            ...new Set(expected?.updates?.flatMap((entry) => entry.years.map(({ year }) => year)) ?? []),
        ]);
        expect(products.every((product) => productSchema.safeParse(product).success)).toBe(true);
    });
});
