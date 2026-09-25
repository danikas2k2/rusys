import { deriveVariantKey } from '~/lib/utils/deriveVariantKey';

describe('deriveVariantKey', () => {
    it('combines count and units into a key', () => {
        expect(deriveVariantKey(500, 'ml')).toBe('500ml');
    });

    it('returns an empty string when count is undefined', () => {
        expect(deriveVariantKey(undefined, 'ml')).toBe('');
    });

    it('returns an empty string when count is null', () => {
        expect(deriveVariantKey(null, 'ml')).toBe('');
    });

    it("returns an empty string when count is ''", () => {
        expect(deriveVariantKey('', 'ml')).toBe('');
    });

    it('returns an empty string when count is 0', () => {
        expect(deriveVariantKey(0, 'ml')).toBe('');
    });
});
