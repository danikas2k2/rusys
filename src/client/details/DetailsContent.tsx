import React from 'react';

import { DetailsTable } from '~/client/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/details/MissingOnlyEffects';

export function DetailsContent() {
    return (
        <MissingOnlyContextWrapper>
            <MissingOnlyEffects />
            <DetailsTable />
        </MissingOnlyContextWrapper>
    );
}
