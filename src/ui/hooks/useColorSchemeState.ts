import { type ColorScheme, ColorSchemeContext, type ColorSchemeHandler } from '@ui/ColorScheme';
import { use } from 'react';

export function useColorSchemeState(): [ColorScheme, ColorSchemeHandler] {
    return use(ColorSchemeContext);
}
