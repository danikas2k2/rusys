import { compareNames } from '~/client/utils/compareNames';

describe('compareNames', () => {
    it('returns 0 when names are the same', () => {
        expect(compareNames('Hello', 'Hello')).toBe(0);
    });

    it('returns 0 when names are the same but different case', () => {
        expect(compareNames('Hello', 'hello')).toBe(0);
    });

    it('returns positive number when first name is greater than second', () => {
        expect(compareNames('World', 'Hello')).toBeGreaterThan(0);
    });

    it('returns negative number when first name is less than second', () => {
        expect(compareNames('Hello', 'World')).toBeLessThan(0);
    });

    it('returns negative when names are the same but different locales', () => {
        expect(compareNames('Privet', 'Привет')).toBeLessThan(0);
    });
});
