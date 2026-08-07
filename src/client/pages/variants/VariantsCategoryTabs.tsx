import { Avatar, Tabs, Tooltip } from '@mantine/core';
import React, { useEffect } from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';

export function VariantsCategoryTabs(): React.ReactElement | null {
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
        <Tabs value={selected} onChange={(value) => value && setSelected(value)} orientation="vertical" variant="pills">
            <Tabs.List>
                {groups.map(({ group, image }) => (
                    <Tabs.Tab key={group} value={group} aria-label={group}>
                        <Tooltip label={group} position="right" withArrow>
                            <Avatar src={image?.url} radius="xl" size="md">
                                {group.trim().charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    </Tabs.Tab>
                ))}
            </Tabs.List>
        </Tabs>
    );
}
