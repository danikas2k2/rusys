import { type ColorScheme, ColorSchemeContext, type ColorSchemeHandler } from '@ui/ColorScheme';
import { useContext } from 'react';

export function useColorSchemeState(): [ColorScheme, ColorSchemeHandler] {
    return useContext(ColorSchemeContext);
}
