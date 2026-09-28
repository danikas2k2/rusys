import React from 'react';

import { Page } from '~/features/common/Page';
import { CategoryRailLayout } from '~/features/filters/CategoryRailLayout';
import { useGroupFilter } from '~/features/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { useSortedGroups } from '~/features/groups/hooks/useSortedGroups';
import { ActiveVariantBox } from '~/features/variants/ActiveVariantBox';
import { useGroupsWithVariants } from '~/features/variants/hooks/useGroupsWithVariants';
import { VariantsTable } from '~/features/variants/VariantsTable';

export function VariantsPage() {
    const groups = useSortedGroups();
    const [selectedGroup, setSelectedGroup] = useGroupFilter();
    const groupsWithVariants = useGroupsWithVariants(useQuickFilterPredicate());

    return (
        <Page withAdd alignToolbarWithCategoryRail>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithVariants}
            >
                <VariantsTable />
            </CategoryRailLayout>
            <ActiveVariantBox />
        </Page>
    );
}
