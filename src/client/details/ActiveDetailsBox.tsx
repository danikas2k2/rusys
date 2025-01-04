import React, { type JSX } from 'react';
import { useActiveRow } from '~/client/common/ActiveRowContext';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { type ActiveDetails } from '~/client/details/ValueRow';

export function ActiveDetailsBox(): JSX.Element | null {
    const [activeDetails, setDetailsGroup] = useActiveRow<ActiveDetails>();
    return activeDetails?.editing ? (
        <DetailsBox group={activeDetails.group} name={activeDetails.name} onClose={() => setDetailsGroup(undefined)} />
    ) : null;
}
