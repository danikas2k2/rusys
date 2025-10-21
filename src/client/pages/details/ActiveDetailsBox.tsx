import React, { type JSX } from 'react';

import { useActiveRow } from '~/client/common/ActiveRowContext';
import { DetailsBox } from '~/client/pages/details/dialogs/DetailsBox';
import { type ActiveDetails } from '~/client/pages/details/ValueRow';

export function ActiveDetailsBox(): JSX.Element | null {
    const [activeDetails, setActiveDetails] = useActiveRow<ActiveDetails>();
    return activeDetails?.editing ? (
        <DetailsBox group={activeDetails.group} name={activeDetails.name} onClose={() => setActiveDetails(undefined)} />
    ) : null;
}
