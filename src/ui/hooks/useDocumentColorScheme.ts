import { type ColorScheme } from '@ui/ColorScheme';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

export function useDocumentColorScheme(auto = true): ColorScheme {
    const [currentColorScheme] = useColorSchemeState();
    const preferredColorScheme = usePreferredColorScheme();
    const colorScheme = auto || currentColorScheme !== 'auto' ? currentColorScheme : preferredColorScheme;

    const documentColorScheme = document.documentElement.dataset.colorScheme ?? 'auto';
    if (colorScheme !== documentColorScheme) {
        if (auto && colorScheme === 'auto') {
            delete document.documentElement.dataset.colorScheme;
        } else {
            document.documentElement.dataset.colorScheme = colorScheme;
        }
    }

    return colorScheme as ColorScheme;
}
