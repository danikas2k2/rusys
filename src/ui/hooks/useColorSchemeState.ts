import { ColorSchemeContext } from '@ui/ColorScheme';
import { type ColorScheme, type ColorSchemeHandler } from '@ui/ColorScheme.types';
import { useContext } from 'react';

export function useColorSchemeState(): [ColorScheme, ColorSchemeHandler] {
    return useContext(ColorSchemeContext);
}
