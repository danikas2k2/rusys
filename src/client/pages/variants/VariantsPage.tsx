import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
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
        <Page withAdd toolbar={<ToolbarGroupFilter />} onDelete={handleDelete}>
            <SwipeControlsWrapper>
                <VariantsTable />
                <SwipeControls />
            </SwipeControlsWrapper>
            <ActiveVariantBox />
        </Page>
    );
}
