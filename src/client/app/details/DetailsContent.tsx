import React from 'react';

import { DetailsTable } from '~/client/app/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/app/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/app/details/MissingOnlyEffects';

export function DetailsContent() {
    return (
        <MissingOnlyContextWrapper>
            <MissingOnlyEffects />
            <DetailsTable />
        </MissingOnlyContextWrapper>
    );
}
