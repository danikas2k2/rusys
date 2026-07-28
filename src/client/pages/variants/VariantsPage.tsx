import { Group } from '@mantine/core';
import React from 'react';

import { SwipeControls } from '~/client/common/SwipeControls';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { Page } from '~/client/pages/common/Page';
import { ActiveVariantBox } from '~/client/pages/variants/ActiveVariantBox';
import { VariantsCategoryRail } from '~/client/pages/variants/VariantsCategoryRail';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { useDeleteVariant } from '~/client/state/variants/useDeleteVariant';
import type { Variant } from '~/types/data';

export function VariantsPage() {
    const deleteVariant = useDeleteVariant();
    const handleDelete = ({ group, variant }: Variant) => deleteVariant(group, variant);

    return (
        <Page withAdd onDelete={handleDelete}>
            <Group align="flex-start" gap="xs" wrap="nowrap">
                <VariantsCategoryRail />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <SwipeControlsWrapper>
                        <VariantsTable />
                        <SwipeControls />
                    </SwipeControlsWrapper>
                </div>
            </Group>
            <ActiveVariantBox />
        </Page>
    );
}
