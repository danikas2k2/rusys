import { Avatar, Tabs } from '@mantine/core';
import React, { useEffect } from 'react';

import './CategoryRail.pcss';

import type { Group } from '~/types/data';

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
                            <Avatar
                                src={image || undefined}
                                radius="sm"
                                size="sm"
                                p={0}
                                data-grayed={!groupsWithContent.has(group)}
                            >
                                {group.trim().charAt(0).toUpperCase()}
                            </Avatar>
                        </Tabs.Tab>
                    );
                })}
            </Tabs.List>
        </Tabs>
    );
}
