'use client';

import { useMantineColorScheme } from '@mantine/core';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeSync() {
    const { theme } = useTheme();
    const { setColorScheme } = useMantineColorScheme();

    useEffect(() => {
        if (theme === 'light' || theme === 'dark') {
            setColorScheme(theme);
        } else if (theme === 'system' || theme === 'auto') {
            setColorScheme('auto');
        }
    }, [theme, setColorScheme]);

    return null;
}
