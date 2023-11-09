import DarkModeIcon from '@icons/DarkMode.svg';
import LightModeIcon from '@icons/LightMode.svg';
import SettingsSuggestIcon from '@icons/SettingsSuggest.svg';
import Button, { ButtonGroup } from '@ui/Button';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import { isEqual } from 'lodash';
import React, { memo } from 'react';

interface ColorSchemeTogglerProps {
    auto?: boolean;
}

export default memo(function ColorSchemeToggler({ auto = true }: ColorSchemeTogglerProps) {
    const [scheme, setScheme] = useColorSchemeState();
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
