import DarkModeIcon from '@icons/DarkMode.svg';
import LightModeIcon from '@icons/LightMode.svg';
import SettingsSuggestIcon from '@icons/SettingsSuggest.svg';
import Button, { ButtonGroup } from '@ui/Button';
import { isEqual } from 'lodash';
import React, { memo, useEffect, useState } from 'react';

export type ColorScheme = 'light' | 'dark' | 'auto';

function usePreferredColorScheme(): ColorScheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function useColorScheme(): ColorScheme {
    const storedColorScheme = localStorage.getItem('preferred-color-scheme') ?? 'auto';
    const documentColorScheme = document.documentElement.dataset.colorScheme ?? 'auto';
    if (storedColorScheme !== documentColorScheme) {
        if (storedColorScheme === 'auto') {
            delete document.documentElement.dataset.colorScheme;
        } else {
            document.documentElement.dataset.colorScheme = storedColorScheme;
        }
    }
    return storedColorScheme as ColorScheme;
}

interface ColorSchemeTogglerProps {
    auto?: boolean;
    localStorageKey?: string;
}

export default memo(function ColorSchemeToggler({
    auto = true,
    localStorageKey = 'preferred-color-scheme',
}: ColorSchemeTogglerProps) {
    const preferredColorScheme = usePreferredColorScheme();
    const currentColorScheme = useColorScheme();
    const [scheme, setScheme] = useState(
        auto || currentColorScheme !== 'auto' ? currentColorScheme : preferredColorScheme
    );

    useEffect(() => {
        if (auto && scheme === 'auto') {
            localStorage.removeItem(localStorageKey);
            delete document.documentElement.dataset.colorScheme;
            return;
        }
        const newScheme = scheme === 'auto' ? preferredColorScheme : scheme;
        localStorage.setItem(localStorageKey, newScheme);
        document.documentElement.dataset.colorScheme = newScheme;
    }, [auto, localStorageKey, preferredColorScheme, scheme, setScheme]);

    return (
        <nav>
            <ButtonGroup>
                <Button
                    color={scheme === 'light' ? 'primary' : 'neutral'}
                    variant={scheme === 'light' ? 'solid' : 'outlined'}
                    onClick={() => setScheme('light')}
                >
                    <LightModeIcon />
                </Button>
                {auto && (
                    <Button
                        color={scheme === 'auto' ? 'primary' : 'neutral'}
                        variant={scheme === 'auto' ? 'solid' : 'outlined'}
                        onClick={() => setScheme('auto')}
                    >
                        <SettingsSuggestIcon />
                    </Button>
                )}
                <Button
                    color={scheme === 'dark' ? 'primary' : 'neutral'}
                    variant={scheme === 'dark' ? 'solid' : 'outlined'}
                    onClick={() => setScheme('dark')}
                >
                    <DarkModeIcon />
                </Button>
            </ButtonGroup>
        </nav>
    );
}, isEqual);
