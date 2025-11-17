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

    it('includes cssVariablesResolver', () => {
        const theme = getTheme();

        expect(theme.cssVariablesResolver).toBeDefined();

        const resolver = theme.cssVariablesResolver();

        expect(resolver).toStrictEqual(
            expect.objectContaining({
                variables: expect.objectContaining({
                    '--mantine-color-white': 'var(--color-base)',
                    '--mantine-color-black': 'var(--color-text)',
                }),
            })
        );
    });

    it('cssVariablesResolver returns function that can be called', () => {
        const theme = getTheme();

        expect(typeof theme.cssVariablesResolver).toBe('function');

        const result = theme.cssVariablesResolver();

        expect(result).toStrictEqual(
            expect.objectContaining({
                variables: expect.objectContaining({
                    '--mantine-color-white': 'var(--color-base)',
                    '--mantine-color-black': 'var(--color-text)',
                }),
                light: expect.any(Object),
                dark: expect.any(Object),
            })
        );
    });
});
