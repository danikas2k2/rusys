import { compareGroups } from '~/client/utils/compareGroups';

describe('compareGroups', () => {
    it('returns 0 when groups are the same', () => {
        expect(compareGroups('Hello', 'Hello')).toBe(0);
    });

    it('returns 0 when groups are the same but different case', () => {
        expect(compareGroups('Hello', 'hello')).toBe(0);
    });

    it('returns positive number when first group is greater than second', () => {
        expect(compareGroups('World', 'Hello')).toBeGreaterThan(0);
    });

    it('returns negative number when first group is less than second', () => {
        expect(compareGroups('Hello', 'World')).toBeLessThan(0);
    });

    it('returns negative when groups are the same but different locales', () => {
        expect(compareGroups('Privet', 'Привет')).toBeLessThan(0);
    });
});
