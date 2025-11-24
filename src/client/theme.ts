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

        fontFamily: 'var(--font-family-body)',
        fontFamilyMonospace: 'var(--font-family-code)',

        defaultRadius: 'md',

        headings: {
            sizes: {
                h1: { fontWeight: 'var(--font-weight-bold)' },
                h2: { fontWeight: 'var(--font-weight-bold)' },
                h3: { fontWeight: 'var(--font-weight-bold)' },
                h4: { fontWeight: 'var(--font-weight-semi-bold)' },
                h5: { fontWeight: 'var(--font-weight-semi-bold)' },
                h6: { fontWeight: 'var(--font-weight-semi-bold)' },
            },
        },

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
            Avatar: {
                styles: {
                    placeholder: {
                        backgroundColor: 'var(--color-base)',
                    },
                },
            },
            AppShell: {
                styles: {
                    header: {
                        backgroundColor: 'var(--color-base)',
                    },
                    footer: {
                        backgroundColor: 'var(--color-base)',
                    },
                },
            },
            Input: {
                styles: {
                    input: {
                        backgroundColor: 'var(--color-base)',
                    },
                },
            },
            InputError: {
                defaultProps: {
                    role: 'alert',
                },
            },
            Select: {
                styles: {
                    input: {
                        backgroundColor: 'var(--color-base)',
                    },
                },
            },
            Burger: {
                styles: {
                    root: {
                        '--burger-color': 'var(--color-text)',
                    },
                },
            },
            Checkbox: {
                styles: {
                    input: {
                        backgroundColor: 'var(--color-base)',
                    },
                },
            },
            NavLink: {
                styles: {
                    root: {},
                    label: {
                        color: 'var(--color-text)',
                        fontSize: 'var(--font-size-base)',
                    },
                },
            },
            Title: {
                styles: {
                    root: {
                        fontSize: 'var(--font-size-base)',
                    },
                },
            },
            Modal: {
                defaultProps: {
                    transitionProps: {
                        transition: 'fade-down',
                        duration: 200,
                        timingFunction: 'ease-out',
                    },
                    overlayProps: {
                        role: 'complementary',
                    },
                },
                styles: {
                    content: {
                        backgroundColor: 'var(--color-base)',
                    },
                    header: {
                        backgroundColor: 'var(--color-base)',
                    },
                    body: {
                        backgroundColor: 'var(--color-base)',
                    },
                    title: {
                        fontSize: 'var(--font-size-large)',
                        fontWeight: 'var(--font-weight-semi-bold)',
                    },
                },
            },
            Drawer: {
                styles: {
                    content: {
                        backgroundColor: 'var(--color-base)',
                    },
                    header: {
                        backgroundColor: 'var(--color-base)',
                    },
                    body: {
                        backgroundColor: 'var(--color-base)',
                    },
                },
            },
            Table: {
                styles: {
                    table: {
                        fontSize: 'var(--font-size-base)',
                        '--table-border-color': 'var(--color-mantle)',
                        marginBlockEnd: '12px',
                    },
                    th: {
                        fontWeight: 'var(--font-weight-normal)',
                    },
                    thead: {
                        position: 'sticky',
                        insetBlockStart: 0,
                        zIndex: 2,
                        backgroundColor: 'var(--color-base)',
                        boxShadow: 'var(--shadow-xsmall)',
                    },
                },
            },
        },
    });
}
