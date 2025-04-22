import { use } from 'react';
import { ColorSchemeContext, type ColorScheme, type ColorSchemeHandler } from '@ui/ColorScheme';

export function useColorSchemeState(): [ColorScheme, ColorSchemeHandler] {
    return use(ColorSchemeContext);
}
