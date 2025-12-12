import { createTheme } from '@mantine/core';

export function getTheme() {
    return createTheme({
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
