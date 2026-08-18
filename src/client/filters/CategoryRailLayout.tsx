import { Group } from '@mantine/core';
import React, { useEffect, useRef } from 'react';

import { CategoryRail } from '~/client/filters/CategoryRail';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';

import './CategoryRailLayout.pcss';

import type { Group as GroupModel } from '~/types/data';

interface CategoryRailLayoutProps {
    groups: readonly GroupModel[];
    selected: string;
    onSelect: (group: string) => void;
    groupsWithContent: ReadonlySet<string>;
}

export function CategoryRailLayout({
    groups,
    selected,
    onSelect,
    groupsWithContent,
    children,
}: React.PropsWithChildren<CategoryRailLayoutProps>): React.ReactElement {
    const [quickFilter] = useQuickFilter();
    const groupBeforeFiltering = useRef<string>();

    // A text filter can leave the selected category empty while results are available elsewhere.
    // Keep the user's category in a ref, temporarily show the first category with a match, then
    // restore their context as soon as the filter is cleared.
    useEffect(() => {
        if (!quickFilter.trim()) {
            const previousGroup = groupBeforeFiltering.current;
            groupBeforeFiltering.current = undefined;
            if (previousGroup && groups.some(({ group }) => group === previousGroup) && previousGroup !== selected) {
                onSelect(previousGroup);
            }
            return;
        }

        if (groupsWithContent.has(selected)) {
            return;
        }

        const matchingGroup = groups.find(({ group }) => groupsWithContent.has(group))?.group;
        if (!matchingGroup) {
            return;
        }

        if (!groupBeforeFiltering.current && groups.some(({ group }) => group === selected)) {
            groupBeforeFiltering.current = selected;
        }
        if (matchingGroup !== selected) {
            onSelect(matchingGroup);
        }
    }, [quickFilter, groups, groupsWithContent, selected, onSelect]);

    return (
        <Group align="flex-start" gap="4" wrap="nowrap">
            <CategoryRail
                groups={groups}
                selected={selected}
                onSelect={onSelect}
                groupsWithContent={groupsWithContent}
            />
            <div className="CategoryRailLayout-content">{children}</div>
        </Group>
    );
}
