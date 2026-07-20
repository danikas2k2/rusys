import { matchParts } from '~/client/utils/matchParts';

describe('matchParts', () => {
    it('returns true when name matches filter', () => {
        expect(matchParts('Hello', 'Hello')).toBe(true);
    });

    it('returns false when name does not match filter', () => {
        expect(matchParts('Hello', 'World')).toBe(false);
    });

    it('returns true when name matches filter with different case', () => {
        expect(matchParts('Hello', 'hello')).toBe(true);
    });

    it('returns true when name matches filter with transliteration', () => {
        expect(matchParts('Привет', 'Privet')).toBe(true);
    });

    it('returns false when name does not match filter with transliteration', () => {
        expect(matchParts('Привет', 'Hello')).toBe(false);
    });

    it('returns true when name matches filter parts', () => {
        expect(matchParts('Hello', 'Hel ll lo')).toBe(true);
    });
});
