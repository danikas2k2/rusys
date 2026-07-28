import { Group } from '@mantine/core';
import React from 'react';

import { CategoryRail } from '~/client/filters/CategoryRail';

import './CategoryRailLayout.pcss';

interface CategoryRailLayoutProps {
    groupsWithContent: ReadonlySet<string>;
}

export function CategoryRailLayout({
    groupsWithContent,
    children,
}: React.PropsWithChildren<CategoryRailLayoutProps>): React.ReactElement {
    return (
        <Group align="flex-start" gap="xs" wrap="nowrap">
            <CategoryRail groupsWithContent={groupsWithContent} />
            <div className="CategoryRailLayout-content">{children}</div>
        </Group>
    );
}
