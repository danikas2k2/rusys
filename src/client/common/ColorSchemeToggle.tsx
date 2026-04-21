import { Center, SegmentedControl, useMantineColorScheme, type MantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun, IconSunMoon } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';

import { useLabels } from '~/client/hooks/useLabels';

interface ColorSchemeToggleProps {
    auto?: boolean;
}

export function ColorSchemeToggle({ auto = true }: ColorSchemeToggleProps) {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [animatedValue, setAnimatedValue] = useState<MantineColorScheme>(colorScheme);
    const _ = useLabels();

    // Sync animatedValue when colorScheme changes elsewhere (e.g. system / another control)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror external scheme into local SegmentedControl value
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
                data-toggle="color-scheme"
                color="primary"
                value={animatedValue}
                onChange={handleChange}
                data={data}
            />
        </Center>
    );
}
