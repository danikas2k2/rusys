import React, { type ComponentType } from 'react';

import { Center, SegmentedControl, useMantineColorScheme, type MantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun, IconSunMoon } from '@tabler/icons-react';

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
    lightModeIcon: LightIcon = IconSun,
    darkModeLabel = 'Dark mode',
    darkModeIcon: DarkIcon = IconMoon,
    autoModeLabel = 'System preferred mode',
    autoModeIcon: AutoIcon = IconSunMoon,
}: ColorSchemeToggleProps) {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    return (
        <Center>
            <SegmentedControl
                // fullWidth
                color="blue"
                value={colorScheme}
                onChange={(scheme) => setColorScheme(scheme as MantineColorScheme)}
                data={[
                    {
                        value: 'light',
                        label: (
                            <Center>
                                <LightIcon aria-label={lightModeLabel} />
                            </Center>
                        ),
                    },
                    ...(auto
                        ? [
                              {
                                  value: 'auto',
                                  label: (
                                      <Center>
                                          <AutoIcon aria-label={autoModeLabel} />
                                      </Center>
                                  ),
                              },
                          ]
                        : []),
                    {
                        value: 'dark',
                        label: (
                            <Center>
                                <DarkIcon aria-label={darkModeLabel} />
                            </Center>
                        ),
                    },
                ]}
            />
        </Center>
    );
}
