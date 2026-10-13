import { Group, Title } from '@mantine/core';
import React, { useEffect, useLayoutEffect, useRef, ViewTransition } from 'react';

import type { Group as GroupModel } from '~/common/data';
import { CategoryRail } from '~/features/filters/CategoryRail';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { prefersReducedMotion } from '~/lib/utils/motion';
import { supportsClippedViewTransitions } from '~/lib/utils/supportsClippedViewTransitions';

import './CategoryRailLayout.css';

interface CategoryRailLayoutProps {
    groups: readonly GroupModel[];
    selected: string;
    onSelect: (group: string) => void;
    groupsWithContent: ReadonlySet<string>;
    /** Additional active filter (e.g. products' missing-only checkbox). */
    filterActive?: boolean;
    animateWithinScrollport?: boolean;
    hideCategoryHeading?: boolean;
}

export function CategoryRailLayout({
    groups,
    selected,
    onSelect,
    groupsWithContent,
    filterActive = false,
    animateWithinScrollport = false,
    hideCategoryHeading = false,
    children,
}: React.PropsWithChildren<CategoryRailLayoutProps>): React.ReactElement {
    const [quickFilter] = useQuickFilter();
    const groupBeforeFiltering = useRef<string | undefined>(undefined);
    const contentRef = useRef<HTMLDivElement>(null);
    const previousSelected = useRef(selected);
    const hasActiveFilter = !!quickFilter.trim() || filterActive;

    useLayoutEffect(() => {
        if (previousSelected.current === selected) {
            return;
        }
        previousSelected.current = selected;
        const content = contentRef.current;
        if (
            (animateWithinScrollport || !supportsClippedViewTransitions()) &&
            !prefersReducedMotion() &&
            content?.animate
        ) {
            content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
        }
    }, [selected, animateWithinScrollport]);

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
                animateWithinScrollport={animateWithinScrollport}
            />
            <ViewTransition update="category-update" default="none">
                <div ref={contentRef} className="CategoryRailLayout-content">
                    {selected && !hideCategoryHeading && (
                        <Title order={1} data-category-heading>
                            {selected}
                        </Title>
                    )}
                    {children}
                </div>
            </ViewTransition>
        </Group>
    );
}
