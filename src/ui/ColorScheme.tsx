import React, { createContext, type PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { usePreviousValue } from '~/common/hooks/usePreviousValue';

export type ColorScheme = 'light' | 'dark' | 'auto';

export type ColorSchemeHandler = (colorScheme: ColorScheme) => void;

export const COLOR_SCHEME_KEY = 'preferred-color-scheme';

export const ColorSchemeContext = createContext<[ColorScheme, ColorSchemeHandler]>(['auto', () => void 0]);

export function ColorSchemeState({ children }: PropsWithChildren): JSX.Element {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        (localStorage.getItem(COLOR_SCHEME_KEY) as ColorScheme) ?? 'auto'
    );

    const previousColorScheme = usePreviousValue(colorScheme) ?? colorScheme;
    useEffect(() => {
        if (previousColorScheme !== colorScheme) {
            if (colorScheme === 'auto') {
                localStorage.removeItem(COLOR_SCHEME_KEY);
            } else {
                localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
            }
        }
    }, [colorScheme, previousColorScheme]);

    const storageListener = useCallback(
        (e: StorageEvent) => {
            if (e.key == null || e.key === COLOR_SCHEME_KEY) {
                const newScheme = (e.newValue ?? 'auto') as ColorScheme;
                if (colorScheme !== newScheme) {
                    setColorScheme(newScheme);
                }
            }
        },
        [colorScheme]
    );

    useEffect(() => {
        addEventListener('storage', storageListener);
        return () => removeEventListener('storage', storageListener);
    }, [storageListener]);

    return <ColorSchemeContext.Provider value={[colorScheme, setColorScheme]}>{children}</ColorSchemeContext.Provider>;
}
