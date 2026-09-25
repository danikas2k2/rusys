import { Center, Switch, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import React from 'react';

import { DarkModeIcon, LightModeIcon } from '@icons';

import { useLabels } from '~/lib/hooks/useLabels';

export function ColorSchemeToggle() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const systemScheme = useComputedColorScheme('light');
    const _ = useLabels();

    const activeScheme = colorScheme === 'auto' ? systemScheme : colorScheme;
    const isDark = activeScheme === 'dark';
    const targetLabel = isDark ? _('Light mode') : _('Dark mode');

    return (
        <Center>
            <Switch
                aria-label={targetLabel}
                checked={isDark}
                color="primary"
                offLabel={<LightModeIcon aria-hidden size={14} />}
                onChange={(event) => setColorScheme(event.currentTarget.checked ? 'dark' : 'light')}
                onLabel={<DarkModeIcon aria-hidden size={14} />}
                size="lg"
                title={targetLabel}
                withThumbIndicator={false}
            />
        </Center>
    );
}
