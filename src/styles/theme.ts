import { createTheme, virtualColor, type MantineThemeColorsOverride } from '@mantine/core';

export function getTheme() {
    return createTheme({
        respectReducedMotion: true,
        colors: [
            // missing catppuccin colors
            'flamingo',
            'lavender',
            'maroon',
            'mauve',
            'peach',
            'rosewater',
            'sapphire',
            'sky',
            // override default colors to use css variables
            'primary',
            'secondary',
            'positive',
            'negative',
            'moderate',
            'neutral',
        ].reduce(
            (acc, color) => ({ ...acc, [color]: virtualColor({ name: color, dark: '', light: '' }) }),
            {} as MantineThemeColorsOverride
        ),
        components: {
            Alert: {
                defaultProps: {
                    role: 'alert',
                },
            },
            Loader: {
                defaultProps: {
                    role: 'progressbar',
                },
            },
            InputError: {
                defaultProps: {
                    role: 'alert',
                },
            },
            Modal: {
                defaultProps: {
                    overlayProps: {
                        role: 'complementary',
                    },
                    transitionProps: {
                        transition: 'fade-down',
                        duration: 200,
                        timingFunction: 'ease-out',
                    },
                },
            },
        },
    });
}
