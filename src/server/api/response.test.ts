import { getGroupsFixture, getProductsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';

import {
    getGroupsResponse,
    getProductsWithGroups,
    getProductsWithVariants,
    getProductsWithYears,
    getVariantsResponse,
    getVariantsWithGroups,
} from '~/server/api/response';
import { getGroups } from '~/server/data/groups';
import { getProducts } from '~/server/data/products';
import { getVariants } from '~/server/data/variants';

vi.mock(import('~/server/db'));
vi.mock(import('~/server/data/years'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/variants'));
vi.mock(import('~/server/data/groups'));

describe('products', () => {
    const years = getYearsFixture();
    const products = getProductsFixture();
    const variants = getVariantsFixture();
    const groups = getGroupsFixture();

    beforeEach(async () => {
        vi.mocked(getProducts).mockResolvedValue(products);
        vi.mocked(getVariants).mockResolvedValue(variants);
        vi.mocked(getGroups).mockResolvedValue(groups);
    });

    afterEach(async () => vi.clearAllMocks());

    describe('getProductsWithYears', () => {
        it('handles products', async () =>
            await expect(getProductsWithYears()).resolves.toStrictEqual({
                years,
                products,
            }));

        it('handles products without years field', async () => {
            const productsWithoutYears: typeof products = [
                { group: 'Test', name: 'Test Item' }, // no years field
                { group: 'Test2', name: 'Test Item 2', years: undefined }, // explicit undefined
            ];

            vi.mocked(getProducts).mockResolvedValueOnce(productsWithoutYears);

            const result = await getProductsWithYears();

            expect(result.products).toStrictEqual(productsWithoutYears);
            expect(result.years).toStrictEqual(years.slice(0, 5).sort((a, b) => b - a));
        });

        it('handles duplicate years (does not add same year twice)', async () => {
            const productsWithDuplicateYears: typeof products = [
                {
                    group: 'Test',
                    name: 'Test Item',
                    years: [
                        { year: 22, amounts: [] },
                        { year: 22, amounts: [] }, // duplicate
                        { year: 21, amounts: [] },
                    ],
                },
            ];

            vi.mocked(getProducts).mockResolvedValueOnce(productsWithDuplicateYears);

            const result = await getProductsWithYears();

            expect(result.products).toStrictEqual(productsWithDuplicateYears);

            const expectedYears = [22, 21, ...years.slice(0, 5)];
            const uniqueYears = [...new Set(expectedYears)].sort((a, b) => b - a);

            expect(result.years).toStrictEqual(uniqueYears);
        });

        it('handles mixed products with and without years', async () => {
            const mixedProducts: typeof products = [
                { group: 'Test1', name: 'No Years' }, // no years
                {
                    group: 'Test2',
                    name: 'With Years',
                    years: [
                        { year: 20, amounts: [] },
                        { year: 21, amounts: [] },
                    ],
                },
                { group: 'Test3', name: 'Also No Years' }, // no years
            ];

            vi.mocked(getProducts).mockResolvedValueOnce(mixedProducts);

            const result = await getProductsWithYears();

            expect(result.products).toStrictEqual(mixedProducts);

            const expectedYears = [20, 21, ...years.slice(0, 5)];
            const uniqueYears = [...new Set(expectedYears)].sort((a, b) => b - a);

            expect(result.years).toStrictEqual(uniqueYears);
        });
    });

    it('getProductsWithVariants', async () =>
        await expect(getProductsWithVariants()).resolves.toStrictEqual({
            years,
            products,
            variants,
        }));

    it('getAllProducts', async () =>
        await expect(getProductsWithGroups()).resolves.toStrictEqual({
            years,
            products,
            groups,
            variants,
        }));

    it('getGroupsResponse', async () => await expect(getGroupsResponse()).resolves.toStrictEqual({ groups }));

    it('getVariantsResponse', async () => await expect(getVariantsResponse()).resolves.toStrictEqual({ variants }));

    it('getVariantsWithGroups', async () =>
        await expect(getVariantsWithGroups()).resolves.toStrictEqual({ variants, groups }));
});
