import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveVariantBox } from '~/client/pages/variants/ActiveVariantBox';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import type { Variant } from '~/types/data';

export function VariantsPage() {
    const deleteVariant = useDeleteVariant();
    const handleDelete = ({ group, variant }: Variant) => deleteVariant(group, variant);

    return (
        <GroupFilterWrapper>
            <QuickFilterWrapper paramName="qv">
                <Page withAdd toolbar={<ToolbarGroupFilter />} onDelete={handleDelete}>
                    <SwipeControlsWrapper>
                        <VariantsTable />
                        <SwipeControls />
                    </SwipeControlsWrapper>
                    <ActiveVariantBox />
                </Page>
            </QuickFilterWrapper>
        </GroupFilterWrapper>
    );
}
