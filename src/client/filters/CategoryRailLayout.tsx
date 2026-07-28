import { Group } from '@mantine/core';
import React from 'react';

import { CategoryRail } from '~/client/filters/CategoryRail';

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
    return (
        <Group align="flex-start" gap="xs" wrap="nowrap">
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
