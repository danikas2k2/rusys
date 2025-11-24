import React, { useEffect, useMemo, useState } from 'react';

import { Center, SegmentedControl, useMantineColorScheme, type MantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun, IconSunMoon } from '@tabler/icons-react';

import { useLabels } from '~/client/hooks/useLabels';

interface ColorSchemeToggleProps {
    auto?: boolean;
}

export function ColorSchemeToggle({ auto = true }: ColorSchemeToggleProps) {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [animatedValue, setAnimatedValue] = useState<MantineColorScheme>(colorScheme);
    const _ = useLabels();

    // Sync animatedValue with colorScheme when it changes externally
    useEffect(() => {
        setAnimatedValue(colorScheme);
    }, [colorScheme]);

    const data = useMemo(
        () => [
            {
                value: 'light',
                label: (
                    <Center>
                        <IconSun aria-label={_('Light mode')} />
                    </Center>
                ),
            },
            ...(auto
                ? [
                      {
                          value: 'auto',
                          label: (
                              <Center>
                                  <IconSunMoon aria-label={_('System preferred mode')} />
                              </Center>
                          ),
                      },
                  ]
                : []),
            {
                value: 'dark',
                label: (
                    <Center>
                        <IconMoon aria-label={_('Dark mode')} />
                    </Center>
                ),
            },
        ],
        [_, auto]
    );

    const handleChange = (scheme: string) => {
        const newScheme = scheme as MantineColorScheme;

        // Immediately update animated value to start animation
        setAnimatedValue(newScheme);

        // Update actual colorScheme after animation completes
        setTimeout(() => {
            setColorScheme(newScheme);
        }, 0);
    };

    return (
        <Center>
            <SegmentedControl
                key="color-scheme-toggle"
                color="blue"
                value={animatedValue}
                onChange={handleChange}
                data={data}
            />
        </Center>
    );
}
