import { getGroups } from '~/server/data/groups';
import { getInitialAppData } from '~/server/data/initialAppData';
import { getProductsWithYears } from '~/server/data/products';
import { getFullSummary } from '~/server/data/summary';
import { getVariants } from '~/server/data/variants';
import { getVisualAppData, getVisualScenario } from '~/tests/fixtures/visualData';

vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/products'));
vi.mock(import('~/server/data/variants'));
vi.mock(import('~/server/data/summary'));
vi.mock(import('~/tests/fixtures/visualData'), () => ({
    getVisualAppData: vi.fn(),
    getVisualScenario: vi.fn(),
}));

afterEach(() => vi.unstubAllEnvs());

describe('visual scenario data', () => {
    afterEach(() => vi.clearAllMocks());

    it('uses the visual scenario without reading database collections', async () => {
        vi.stubEnv('PLAYWRIGHT_TEST', '1');
        const result = { data: { groups: [] }, resource: 'groups' as const };
        vi.mocked(getVisualScenario).mockResolvedValueOnce('basic');
        vi.mocked(getVisualAppData).mockReturnValueOnce(result);

        await expect(getInitialAppData('/categories')).resolves.toBe(result);

        expect(getVisualAppData).toHaveBeenCalledExactlyOnceWith('/categories', 'basic');
        expect(getGroups).not.toHaveBeenCalled();
    });

    it('reads database collections when visual mode has no scenario', async () => {
        vi.stubEnv('PLAYWRIGHT_TEST', '1');
        vi.mocked(getVisualScenario).mockResolvedValueOnce(undefined);
        vi.mocked(getGroups).mockResolvedValueOnce([{ group: 'First', order: 0 }]);

        await expect(getInitialAppData('/categories')).resolves.toMatchObject({
            resource: 'groups',
            initialGroup: 'First',
        });

        expect(getVisualAppData).not.toHaveBeenCalled();
        expect(getGroups).toHaveBeenCalledExactlyOnceWith();
    });
});

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

    it('loads summary and falls back to the first category when it has no items', async () => {
        vi.mocked(getFullSummary).mockResolvedValueOnce({
            groups: [{ group: 'First', order: 0 }],
            summary: [],
            years: [],
        });

        await expect(getInitialAppData('/summary')).resolves.toMatchObject({
            resource: 'summary',
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
