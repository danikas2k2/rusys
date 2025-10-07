import { matchParts } from '~/client/app/utils/matchParts';

describe('matchParts', () => {
    it('returns true when name matches filter', () => {
        expect(matchParts('Hello', 'Hello')).toBeTrue();
    });

    it('returns false when name does not match filter', () => {
        expect(matchParts('Hello', 'World')).toBeFalse();
    });

    it('returns true when name matches filter with different case', () => {
        expect(matchParts('Hello', 'hello')).toBeTrue();
    });

    it('returns true when name matches filter with transliteration', () => {
        expect(matchParts('Привет', 'Privet')).toBeTrue();
    });

    it('returns false when name does not match filter with transliteration', () => {
        expect(matchParts('Привет', 'Hello')).toBeFalse();
    });

    it('returns true when name matches filter parts', () => {
        expect(matchParts('Hello', 'Hel ll lo')).toBeTrue();
    });
});
