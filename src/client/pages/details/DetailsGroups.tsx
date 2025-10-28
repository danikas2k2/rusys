import React from 'react';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { DetailsGroup } from '~/client/pages/details/DetailsGroup';
import type { Details } from '~/types/data';

interface DetailsGroupsProps {
    groups: readonly string[];
    details: readonly Details[];
}

export function DetailsGroups({ groups, details }: DetailsGroupsProps) {
    const group = useGroupFilter();

    return (
        <>
            {groups.map((g) => {
                const groupDetails = details.filter((v) => v.group === g);
                return groupDetails.length || (group && g === group) ? (
                    <DetailsGroup key={g} group={g} details={groupDetails} />
                ) : null;
            })}
        </>
    );
}
