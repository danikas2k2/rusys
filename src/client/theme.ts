import { createTheme /*, type MantineColorsTuple*/ } from '@mantine/core';

// const createColorTuple = (colorName: string): MantineColorsTuple => {
//     const lightVar = `var(--ctp-latte-${colorName})`;
//     const darkVar = `var(--ctp-mocha-${colorName})`;
//     const baseVar = `var(--color-${colorName})`;
//
//     return [lightVar, baseVar, baseVar, baseVar, baseVar, baseVar, baseVar, darkVar, darkVar, darkVar];
// };

export function getTheme() {
    return createTheme({
        // colors: {
        //     // Primary colors
        //     blue: createColorTuple('blue'),
        //     red: createColorTuple('red'),
        //     green: createColorTuple('green'),
        //     yellow: createColorTuple('yellow'),
        //
        //     // Additional Catppuccin colors
        //     mauve: createColorTuple('mauve'),
        //     pink: createColorTuple('pink'),
        //     teal: createColorTuple('teal'),
        //     sky: createColorTuple('sky'),
        //     sapphire: createColorTuple('sapphire'),
        //     lavender: createColorTuple('lavender'),
        // },
        //
        primaryColor: 'blue',
        // secondaryColor: 'mauve',
        //
        // // Light theme (Latte) / Dark theme (Mocha)
        // white: 'var(--color-base)',
        // black: 'var(--color-text)',

        fontFamily: 'var(--font-family-body)',
        fontFamilyMonospace: 'var(--font-family-code)',

        defaultRadius: 'md',

        components: {
            NavLink: {
                styles: {
                    label: {
                        fontSize: '1rem', // arba theme.fontSizes.md
                    },
                },
            },
            Modal: {
                styles: {
                    title: {
                        fontSize: 'var(--mantine-font-size-lg)',
                        fontWeight: 600,
                    },
                },
            },
        },
    });
}
