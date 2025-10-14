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
            // eslint-disable-next-line react-hooks/immutability
            delete document.documentElement.dataset.colorScheme;
        } else {
            // eslint-disable-next-line react-hooks/immutability
            document.documentElement.dataset.colorScheme = colorScheme;
        }
    }

    return colorScheme as ColorScheme;
}
