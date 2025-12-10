import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Create Mantine color tuple using Catppuccin colors with color-mix for shades
// Index 8 is the base color, 0-7 are lighter (mixed with base), 9 is darker (mixed with text)
function createColorTuple(colorName: string): MantineColorsTuple {
    const color = `var(--color-${colorName})`;
    const base = 'var(--color-base)'; // background color (light in light theme, dark in dark theme)
    const text = 'var(--color-text)'; // text color (dark in light theme, light in dark theme)

    return [
        `color-mix(in srgb, ${color} 20%, ${base} 80%)`, // 0: very light
        `color-mix(in srgb, ${color} 30%, ${base} 70%)`, // 1: extra light
        `color-mix(in srgb, ${color} 40%, ${base} 60%)`, // 2: light
        `color-mix(in srgb, ${color} 50%, ${base} 50%)`, // 3: lighter
        `color-mix(in srgb, ${color} 60%, ${base} 40%)`, // 4: semi-light
        `color-mix(in srgb, ${color} 70%, ${base} 30%)`, // 5: slightly light
        `color-mix(in srgb, ${color} 80%, ${base} 20%)`, // 6: almost base
        `color-mix(in srgb, ${color} 90%, ${base} 10%)`, // 7: near base
        color, // 8: base color
        `color-mix(in srgb, ${color} 80%, ${text} 20%)`, // 9: slightly darker
    ];
}

const TRANSITION = 'fade-down';
const TRANSITION_DURATION = 200;
const TRANSITION_TIMING_FUNCTION = 'ease-out';

export function getTheme() {
    return createTheme({
        // Override Mantine system colors with Catppuccin palette
        colors: {
            // Primary colors
            blue: createColorTuple('blue'),
            red: createColorTuple('red'),
            green: createColorTuple('green'),
            yellow: createColorTuple('yellow'),
            grape: createColorTuple('mauve'),
            violet: createColorTuple('mauve'),
            indigo: createColorTuple('lavender'),
            cyan: createColorTuple('sky'),
            lime: createColorTuple('green'),
            orange: createColorTuple('peach'),
            // gray: createColorTuple('overlay0'),
            // dark: createColorTuple('base'),

            // Catppuccin colors
            mauve: createColorTuple('mauve'),
            pink: createColorTuple('pink'),
            teal: createColorTuple('teal'),
            sky: createColorTuple('sky'),
            sapphire: createColorTuple('sapphire'),
            lavender: createColorTuple('lavender'),
            peach: createColorTuple('peach'),
            maroon: createColorTuple('maroon'),
            rosewater: createColorTuple('rosewater'),
            flamingo: createColorTuple('flamingo'),
        },

        primaryColor: 'blue',

        // Light theme (Latte) / Dark theme (Mocha) via CSS variables
        white: 'var(--color-base)',
        black: 'var(--color-text)',

        defaultRadius: 'md',

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
                        transition: TRANSITION,
                        duration: TRANSITION_DURATION,
                        timingFunction: TRANSITION_TIMING_FUNCTION,
                    },
                },
            },
        },
    });
}
