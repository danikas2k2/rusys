import DarkModeIcon from '@icons/DarkMode.svg';
import LightModeIcon from '@icons/LightMode.svg';
import SettingsSuggestIcon from '@icons/SettingsSuggest.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import React from 'react';

interface ColorSchemeTogglerProps {
    auto?: boolean;
    lightModeLabel?: string;
    darkModeLabel?: string;
    autoModeLabel?: string;
}

export function ColorSchemeToggler({
    auto = true,
    lightModeLabel = 'Light mode',
    darkModeLabel = 'Dark mode',
    autoModeLabel = 'System preferred mode',
}: ColorSchemeTogglerProps) {
    const [scheme, setScheme] = useColorSchemeState();
    return (
        <nav>
            <ButtonGroup>
                <Button
                    color={scheme === 'light' ? 'primary' : 'neutral'}
                    variant={scheme === 'light' ? 'solid' : 'outlined'}
                    aria-label={lightModeLabel}
                    aria-pressed={scheme === 'light'}
                    onClick={() => setScheme('light')}
                >
                    <LightModeIcon />
                </Button>
                {auto && (
                    <Button
                        color={scheme === 'auto' ? 'primary' : 'neutral'}
                        variant={scheme === 'auto' ? 'solid' : 'outlined'}
                        aria-label={autoModeLabel}
                        aria-pressed={scheme === 'auto'}
                        onClick={() => setScheme('auto')}
                    >
                        <SettingsSuggestIcon />
                    </Button>
                )}
                <Button
                    color={scheme === 'dark' ? 'primary' : 'neutral'}
                    variant={scheme === 'dark' ? 'solid' : 'outlined'}
                    aria-label={darkModeLabel}
                    aria-pressed={scheme === 'dark'}
                    onClick={() => setScheme('dark')}
                >
                    <DarkModeIcon />
                </Button>
            </ButtonGroup>
        </nav>
    );
}
