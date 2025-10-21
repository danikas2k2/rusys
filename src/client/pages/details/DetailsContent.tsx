import React from 'react';

import { DetailsTable } from '~/client/pages/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/pages/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/details/MissingOnlyEffects';

export function DetailsContent() {
    return (
        <MissingOnlyContextWrapper>
            <MissingOnlyEffects />
            <DetailsTable />
        </MissingOnlyContextWrapper>
    );
}
