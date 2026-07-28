import { Avatar, Tabs, Tooltip } from '@mantine/core';
import React, { useEffect } from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';

import './CategoryRail.pcss';

interface CategoryRailProps {
    groupsWithContent: ReadonlySet<string>;
}

export function CategoryRail({ groupsWithContent }: CategoryRailProps): React.ReactElement | null {
    const groups = useSortedGroups();
    const [selected, setSelected] = useGroupFilter();

    // Default to the first category when none is selected yet, or the selected one no longer exists
    useEffect(() => {
        if (groups.length && !groups.some(({ group }) => group === selected)) {
            setSelected(groups[0]!.group);
        }
    }, [groups, selected, setSelected]);

    if (!groups.length) {
        return null;
    }

    return (
        <Tabs
            value={selected}
            onChange={(value) => value && setSelected(value)}
            orientation="vertical"
            variant="outline"
            data-tabs="category-rail"
        >
            <Tabs.List>
                {groups.map(({ group, image }) => (
                    <Tabs.Tab key={group} value={group} aria-label={group} p={8}>
                        <Tooltip label={group} position="right" withArrow>
                            <Avatar
                                src={image || undefined}
                                radius="sm"
                                size="sm"
                                p={0}
                                data-grayed={!groupsWithContent.has(group)}
                            >
                                {group.trim().charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    </Tabs.Tab>
                ))}
            </Tabs.List>
        </Tabs>
    );
}
