import DarkModeIcon from '@assets/DarkMode.svg';
import LightModeIcon from '@assets/LightMode.svg';
import AutoModeIcon from '@assets/Routine.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import React, { type ComponentType } from 'react';

interface ColorSchemeToggleProps {
    auto?: boolean;
    lightModeLabel?: string;
    lightModeIcon?: ComponentType;
    darkModeLabel?: string;
    darkModeIcon?: ComponentType;
    autoModeLabel?: string;
    autoModeIcon?: ComponentType;
}

export function ColorSchemeToggle({
    auto = true,
    lightModeLabel = 'Light mode',
    lightModeIcon: LightIcon = LightModeIcon,
    darkModeLabel = 'Dark mode',
    darkModeIcon: DarkIcon = DarkModeIcon,
    autoModeLabel = 'System preferred mode',
    autoModeIcon: AutoIcon = AutoModeIcon,
}: ColorSchemeToggleProps) {
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
                    <LightIcon />
                </Button>
                {auto && (
                    <Button
                        color={scheme === 'auto' ? 'primary' : 'neutral'}
                        variant={scheme === 'auto' ? 'solid' : 'outlined'}
                        aria-label={autoModeLabel}
                        aria-pressed={scheme === 'auto'}
                        onClick={() => setScheme('auto')}
                    >
                        <AutoIcon />
                    </Button>
                )}
                <Button
                    color={scheme === 'dark' ? 'primary' : 'neutral'}
                    variant={scheme === 'dark' ? 'solid' : 'outlined'}
                    aria-label={darkModeLabel}
                    aria-pressed={scheme === 'dark'}
                    onClick={() => setScheme('dark')}
                >
                    <DarkIcon />
                </Button>
            </ButtonGroup>
        </nav>
    );
}
