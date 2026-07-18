import { gravatarUrl } from '~/client/utils/gravatar';

describe('gravatarUrl', () => {
    it('returns a gravatar url for email', () => {
        const url = gravatarUrl('Test@Example.COM');

        expect(url).toContain('gravatar.com/avatar/');
        expect(url).toContain('d=identicon');
        expect(url).toContain('s=64');
    });

    it('normalises email before hashing', () => {
        expect(gravatarUrl('user@example.com')).toBe(gravatarUrl('USER@EXAMPLE.COM'));
        expect(gravatarUrl('  user@example.com  ')).toBe(gravatarUrl('user@example.com'));
    });

    it('respects custom size', () => {
        const url = gravatarUrl('user@example.com', 128);

        expect(url).toContain('s=128');
    });
});
