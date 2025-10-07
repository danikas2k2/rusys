import React from 'react';

import { SummaryGroup } from '~/client/app/summary/SummaryGroup';
import { type Summary } from '~/types/data';

interface SummaryGroupsProps {
    groups: ReadonlyArray<string>;
    summary: ReadonlyArray<Summary>;
}

// TODO add view for used vs removed items
export function SummaryGroups({ groups, summary }: SummaryGroupsProps) {
    return (
        <>
            {groups.map((g) => (
                <SummaryGroup key={g} group={g} summary={summary.filter((v) => v.group === g)} />
            ))}
        </>
    );
}
