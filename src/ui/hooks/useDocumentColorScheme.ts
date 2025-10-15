import { useEffect } from 'react';

import { type ColorScheme } from '@ui/ColorScheme';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

export function useDocumentColorScheme(auto = true): ColorScheme {
    const [currentColorScheme] = useColorSchemeState();
    const preferredColorScheme = usePreferredColorScheme();
    const colorScheme = auto || currentColorScheme !== 'auto' ? currentColorScheme : preferredColorScheme;

    useEffect(() => {
        const dataset = document.documentElement.dataset;
        if (colorScheme !== (dataset.colorScheme ?? 'auto')) {
            if (auto && colorScheme === 'auto') {
                delete dataset.colorScheme;
            } else {
                dataset.colorScheme = colorScheme;
            }
        }
    }, [auto, colorScheme]);

    return colorScheme as ColorScheme;
}
