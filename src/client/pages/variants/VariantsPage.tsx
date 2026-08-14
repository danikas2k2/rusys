import React from 'react';

import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { Page } from '~/client/pages/common/Page';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ActiveVariantBox } from '~/client/pages/variants/ActiveVariantBox';
import { useGroupsWithVariants } from '~/client/pages/variants/hooks/useGroupsWithVariants';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';

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
