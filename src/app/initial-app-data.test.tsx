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

        expect(result).toMatchObject({
            resource: 'products',
            initialGroup: 'Produce',
            data: { products: [{ group: 'Produce', name: 'Apples' }], years: [26] },
        });
    });
});
