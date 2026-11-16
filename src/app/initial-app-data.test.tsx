import { getGroups } from '~/server/data/groups';
import { getInitialAppData } from '~/server/data/initialAppData';
import { getProductsWithYears } from '~/server/data/products';
import { getVariants } from '~/server/data/variants';

vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/variants'));

describe('server-loaded product page', () => {
    it('loads collections directly and opens the first category with products', async () => {
        vi.mocked(getGroups).mockResolvedValue([
            { group: 'Empty', order: 0 },
            { group: 'Produce', order: 1 },
        ]);
        vi.mocked(getProductsWithYears).mockResolvedValue({
            products: [{ group: 'Produce', name: 'Apples' }],
            years: [26],
        });
        vi.mocked(getVariants).mockResolvedValue([{ group: 'Produce', variant: 'kg', order: 0 }]);

        const result = await getInitialAppData('/products');

        const session = vi.mocked(getProductsWithYears).mock.calls[0]?.[0];

        expect(session).toBeDefined();
        expect(getGroups).toHaveBeenCalledWith(session);
        expect(getVariants).toHaveBeenCalledWith(session);

        expect(result).toMatchObject({
            resource: 'products',
            initialGroup: 'Produce',
            data: { products: [{ group: 'Produce', name: 'Apples' }], years: [26] },
        });
    });
});

describe('server-loaded page resources', () => {
    afterEach(() => vi.clearAllMocks());

    it('loads categories and opens the first category', async () => {
        vi.mocked(getGroups).mockResolvedValueOnce([{ group: 'First', order: 0 }]);

        await expect(getInitialAppData('/categories')).resolves.toMatchObject({
            resource: 'groups',
            data: { groups: [{ group: 'First', order: 0 }] },
            initialGroup: 'First',
        });
    });

    it('opens the first category with a variant', async () => {
        vi.mocked(getGroups).mockResolvedValueOnce([
            { group: 'Empty', order: 0 },
            { group: 'Filled', order: 1 },
        ]);
        vi.mocked(getVariants).mockResolvedValueOnce([{ group: 'Filled', variant: 'Large', order: 0 }]);

        await expect(getInitialAppData('/variants')).resolves.toMatchObject({
            resource: 'variants',
            initialGroup: 'Filled',
        });
    });

    it('loads product data for the removed summary route', async () => {
        vi.mocked(getGroups).mockResolvedValueOnce([{ group: 'First', order: 0 }]);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products: [], years: [] });
        vi.mocked(getVariants).mockResolvedValueOnce([]);

        await expect(getInitialAppData('/summary')).resolves.toMatchObject({
            resource: 'products',
            initialGroup: 'First',
        });
    });

    it('has no selected category when product data and categories are empty', async () => {
        vi.mocked(getGroups).mockResolvedValueOnce([]);
        vi.mocked(getProductsWithYears).mockResolvedValueOnce({ products: [], years: [] });
        vi.mocked(getVariants).mockResolvedValueOnce([]);

        await expect(getInitialAppData('/products')).resolves.toMatchObject({
            resource: 'products',
            initialGroup: undefined,
        });
    });
});

vi.mock(import('~/server/db'));
