import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { CategoryRailLayout } from '~/client/filters/CategoryRailLayout';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { Page } from '~/client/pages/common/Page';
import { useSortedGroups } from '~/client/pages/groups/hooks/useSortedGroups';
import { ActiveVariantBox } from '~/client/pages/variants/ActiveVariantBox';
import { useGroupsWithVariants } from '~/client/pages/variants/hooks/useGroupsWithVariants';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import type { Variant } from '~/types/data';

export function VariantsPage() {
    const deleteVariant = useDeleteVariant();
    const handleDelete = ({ group, variant }: Variant) => deleteVariant(group, variant);
    const groups = useSortedGroups();
    const [selectedGroup, setSelectedGroup] = useGroupFilter();
    const groupsWithVariants = useGroupsWithVariants(useQuickFilterPredicate());

    return (
        <Page withAdd onDelete={handleDelete} alignToolbarWithCategoryRail>
            <CategoryRailLayout
                groups={groups}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
                groupsWithContent={groupsWithVariants}
            >
                <SwipeControlsWrapper>
                    <VariantsTable />
                    <SwipeControls />
                </SwipeControlsWrapper>
            </CategoryRailLayout>
            <ActiveVariantBox />
        </Page>
    );
}
