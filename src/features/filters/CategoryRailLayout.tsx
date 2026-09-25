import { Group, Title } from '@mantine/core';
import type { Group as GroupModel } from '@rusys/common/data';
import React, { useEffect, useRef } from 'react';

import { CategoryRail } from '~/features/filters/CategoryRail';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';

interface CategoryRailLayoutProps {
    groups: readonly GroupModel[];
    selected: string;
    onSelect: (group: string) => void;
    groupsWithContent: ReadonlySet<string>;
    /** Additional active filter (e.g. products' missing-only checkbox). */
    filterActive?: boolean;
}

export function CategoryRailLayout({
    groups,
    selected,
    onSelect,
    groupsWithContent,
    filterActive = false,
    children,
}: React.PropsWithChildren<CategoryRailLayoutProps>): React.ReactElement {
    const [quickFilter] = useQuickFilter();
    const groupBeforeFiltering = useRef<string | undefined>(undefined);
    const hasActiveFilter = !!quickFilter.trim() || filterActive;

    // A text filter can leave the selected category empty while results are available elsewhere.
    // Keep the user's category in a ref, temporarily show the first category with a match, then
    // restore their context as soon as the filter is cleared.
    useEffect(() => {
        if (!hasActiveFilter) {
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
    }, [hasActiveFilter, groups, groupsWithContent, selected, onSelect]);

    return (
        <Group align="flex-start" gap="4" wrap="nowrap">
            <CategoryRail
                groups={groups}
                selected={selected}
                onSelect={onSelect}
                groupsWithContent={groupsWithContent}
            />
            <div className="CategoryRailLayout-content">
                {selected && (
                    <Title order={2} data-category-heading>
                        {selected}
                    </Title>
                )}
                {children}
            </div>
        </Group>
    );
}
