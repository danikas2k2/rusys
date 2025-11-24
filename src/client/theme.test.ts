import { getTheme } from './theme';

describe('theme', () => {
    it('returns theme with correct structure', () => {
        const theme = getTheme();

        expect(theme).toStrictEqual(
            expect.objectContaining({
                primaryColor: 'blue',
                white: 'var(--color-base)',
                black: 'var(--color-text)',
                fontFamily: 'var(--font-family-body)',
                fontFamilyMonospace: 'var(--font-family-code)',
                defaultRadius: 'md',
            })
        );
    });

    it('includes all color tuples', () => {
        const theme = getTheme();
        const colors = Array(10).fill(expect.any(String));

        expect(theme.colors).toStrictEqual(
            expect.objectContaining({
                blue: colors,
                red: colors,
                green: colors,
                yellow: colors,
                mauve: colors,
                pink: colors,
            })
        );
    });

    it('includes component configurations', () => {
        const theme = getTheme();

        expect(theme.components).toStrictEqual(
            expect.objectContaining({
                Alert: expect.any(Object),
                Loader: expect.any(Object),
                Modal: expect.any(Object),
                Table: expect.any(Object),
            })
        );
    });
});
