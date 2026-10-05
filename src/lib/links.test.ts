import { Links } from './links';

describe('links', () => {
    it('defines all route links', () => {
        expect(Links.PRODUCTS).toBe('/');
        expect(Links.CATEGORIES).toBe('/categories');
        expect(Links.VARIANTS).toBe('/variants');
        expect(Links.SUMMARY).toBe('/summary');
    });
});
