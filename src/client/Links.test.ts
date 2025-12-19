import { Links } from './Links';

describe('links', () => {
    it('defines all route links', () => {
        expect(Links.PRODUCTS).toBe('/');
        expect(Links.GROUPS).toBe('/groups');
        expect(Links.VARIANTS).toBe('/variants');
        expect(Links.SUMMARY).toBe('/summary');
        expect(Links.HISTORY).toBe('/history');
    });
});
