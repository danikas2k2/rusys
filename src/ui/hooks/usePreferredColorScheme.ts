import { type ColorScheme } from '@ui/ColorScheme';

export function usePreferredColorScheme(): ColorScheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
