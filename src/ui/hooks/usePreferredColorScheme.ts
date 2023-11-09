import { ColorScheme } from '@ui/ColorScheme.types';

export function usePreferredColorScheme(): ColorScheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
