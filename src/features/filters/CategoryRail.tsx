import { Group as MantineGroup, Tabs, Text } from '@mantine/core';
import React, { startTransition, useEffect, useLayoutEffect, useRef } from 'react';

import { Thumbnail } from '~/components/common/Thumbnail';
import { trackFaroEvent } from '~/lib/observability/faro';
import { supportsClippedViewTransitions } from '~/lib/utils/supportsClippedViewTransitions';
import type { Group } from '~/schema';

import './CategoryRail.css';

interface CategoryRailProps {
    groups: readonly Group[];
    selected: string;
    onSelect: (group: string) => void;
    groupsWithContent: ReadonlySet<string>;
    animateWithinScrollport?: boolean;
}

export function CategoryRail({
    groups,
    selected,
    onSelect,
    groupsWithContent,
    animateWithinScrollport = false,
}: CategoryRailProps): React.ReactElement | null {
    const railRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const rail = railRef.current;
        const viewport = rail?.closest<HTMLElement>('[data-scrollarea-viewport]');
        if (!rail || !viewport) {
            return;
        }
        const updateHeight = () => rail.style.setProperty('--category-rail-height', `${viewport.clientHeight}px`);
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, [groups.length]);

    useLayoutEffect(() => {
        const rail = railRef.current;
        const activeTab = rail?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
        if (!rail || !activeTab || rail.clientHeight === 0) {
            return;
        }
        const clearance = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const viewportTop = rail.getBoundingClientRect().top + rail.clientTop;
        const railTop = viewportTop + clearance;
        const railBottom = viewportTop + rail.clientHeight - clearance;
        const tabBounds = activeTab.getBoundingClientRect();
        // Adjust only this scrollport; scrollIntoView could also move the product content.
        if (tabBounds.top < railTop) {
            rail.scrollTop += tabBounds.top - railTop;
        } else if (tabBounds.bottom > railBottom) {
            rail.scrollTop += tabBounds.bottom - railBottom;
        }
    }, [selected, groups]);

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
            ref={railRef}
            value={selected}
            onChange={(value) => {
                if (!value) {
                    return;
                }
                if (value !== selected) {
                    trackFaroEvent('filter_applied');
                }
                if (!animateWithinScrollport && supportsClippedViewTransitions()) {
                    startTransition(() => onSelect(value));
                } else {
                    onSelect(value);
                }
            }}
            orientation="vertical"
            variant="outline"
            data-tabs="category-rail"
            data-independent-scroll
        >
            <Tabs.List>
                {groups.map(({ group, image }) => {
                    const isActive = group === selected;
                    return (
                        <Tabs.Tab key={group} value={group} px={8} py={isActive ? 12 : 8}>
                            <MantineGroup gap="xs" wrap="nowrap" justify="flex-start">
                                <Thumbnail
                                    src={image}
                                    alt=""
                                    aria-hidden="true"
                                    fallback={group.trim().charAt(0).toUpperCase()}
                                    radius="sm"
                                    size="sm"
                                    p={0}
                                    data-grayed={!groupsWithContent.has(group)}
                                />
                                {/* Only the avatar is visible below `sm` - there's no room for
                                    a label next to a narrow vertical rail on a phone; the label
                                    remains available to assistive technology. */}
                                <Text size="sm" lineClamp={1} ta="start" data-category-label title={group}>
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
