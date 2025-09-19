import React from 'react';

import { DetailsTable } from '~/client/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/details/MissingOnlyEffects';
import { GroupFilterContextWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterContextWrapper } from '~/client/filters/QuickFilterContext';

export function DetailsContent() {
    return (
        <MissingOnlyContextWrapper>
            <MissingOnlyEffects />
            <GroupFilterContextWrapper>
                <QuickFilterContextWrapper>
                    <DetailsTable />
                </QuickFilterContextWrapper>
            </GroupFilterContextWrapper>
        </MissingOnlyContextWrapper>
    );
}
