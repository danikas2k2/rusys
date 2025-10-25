import type { MantineColorScheme } from '@mantine/core';

export function usePreferredColorScheme(): MantineColorScheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
