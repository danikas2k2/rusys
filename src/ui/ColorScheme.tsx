import { type ColorScheme, type ColorSchemeHandler } from '@ui/ColorScheme.types';
import React, { createContext, type PropsWithChildren, useCallback, useEffect, useState } from 'react';

const LOCAL_STORAGE_KEY = 'preferred-color-scheme';

export const ColorSchemeContext = createContext<[ColorScheme, ColorSchemeHandler]>(['auto', () => {}]);

export function ColorSchemeState({ children }: PropsWithChildren): JSX.Element {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        (localStorage.getItem(LOCAL_STORAGE_KEY) as ColorScheme) ?? 'auto'
    );

    useEffect(() => {
        if (colorScheme === 'auto') {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } else {
            localStorage.setItem(LOCAL_STORAGE_KEY, colorScheme);
        }
    }, [colorScheme]);

    const storageListener = useCallback(
        (e: StorageEvent) => {
            if (e.key == null || e.key === LOCAL_STORAGE_KEY) {
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
