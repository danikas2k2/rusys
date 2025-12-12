import { getTheme } from './theme';

describe('theme', () => {
    it('returns theme with correct structure', () => {
        const theme = getTheme();

        expect(theme).toStrictEqual(
            expect.objectContaining({
                primaryColor: 'blue',
                // white: 'var(--color-base)',
                // black: 'var(--color-text)',
                defaultRadius: 'md',
            })
        );
    });

    it('includes all color tuples', () => {
        const theme = getTheme();
        const colors = Array(10).fill(expect.any(String));

        expect(theme.colors).toStrictEqual(
            expect.objectContaining({
                // Primary colors
                blue: colors,
                red: colors,
                green: colors,
                yellow: colors,
                grape: colors,
                violet: colors,
                indigo: colors,
                cyan: colors,
                lime: colors,
                orange: colors,
                // Catppuccin colors
                mauve: colors,
                pink: colors,
                teal: colors,
                sky: colors,
                sapphire: colors,
                lavender: colors,
                peach: colors,
                maroon: colors,
                rosewater: colors,
                flamingo: colors,
            })
        );
    });

    it('includes component configurations', () => {
        const theme = getTheme();

        expect(theme.components).toStrictEqual(
            expect.objectContaining({
                Alert: expect.any(Object),
                Loader: expect.any(Object),
                InputError: expect.any(Object),
                Modal: expect.any(Object),
            })
        );
    });
});
