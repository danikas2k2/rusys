import { Avatar, Group as MantineGroup, Tabs, Text } from '@mantine/core';
import React, { useEffect } from 'react';

import type { Group } from '~/common/data';

interface CategoryRailProps {
    groups: readonly Group[];
    selected: string;
    onSelect: (group: string) => void;
    groupsWithContent: ReadonlySet<string>;
}

export function CategoryRail({
    groups,
    selected,
    onSelect,
    groupsWithContent,
}: CategoryRailProps): React.ReactElement | null {
    // Default to the first category when none is selected yet, or the selected one no longer exists
    useEffect(() => {
        if (groups.length && !groups.some(({ group }) => group === selected)) {
            onSelect(groups[0]!.group);
        }
    }, [groups, selected, onSelect]);

    if (!groups.length) {
        return null;
    }

    return (
        <Tabs
            value={selected}
            onChange={(value) => value && onSelect(value)}
            orientation="vertical"
            variant="outline"
            data-tabs="category-rail"
        >
            <Tabs.List>
                {groups.map(({ group, image }) => {
                    const isActive = group === selected;
                    return (
                        <Tabs.Tab key={group} value={group} aria-label={group} px={8} py={isActive ? 12 : 8}>
                            <MantineGroup gap="xs" wrap="nowrap" justify="flex-start">
                                <Avatar
                                    src={image || undefined}
                                    radius="sm"
                                    size="sm"
                                    p={0}
                                    data-grayed={!groupsWithContent.has(group)}
                                >
                                    {group.trim().charAt(0).toUpperCase()}
                                </Avatar>
                                {/* Only the avatar is meaningful below `sm` - there's no room for
                                    a label next to a narrow vertical rail on a phone; wider
                                    screens (landscape phone, tablet, desktop) have space to spare. */}
                                <Text
                                    size="sm"
                                    visibleFrom="sm"
                                    lineClamp={1}
                                    ta="start"
                                    data-category-label
                                    title={group}
                                >
                                    {group}
                                </Text>
                            </MantineGroup>
                        </Tabs.Tab>
                    );
                })}
            </Tabs.List>
        </Tabs>
    );
}
