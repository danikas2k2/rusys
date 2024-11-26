import React from 'react';
import { ActiveRowContextWrapper } from '~/client/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/common/ActiveRowOutsideClick';
import { SortableGroup } from '~/client/variants/SortableGroup';

interface SortableVariantsProps {
    className?: string;
    groups: string[];
}

export function SortableGroups({ className, groups }: SortableVariantsProps) {
    return (
        <ActiveRowContextWrapper>
            <ActiveRowOutsideClick />
            {groups.map((g) => (
                <SortableGroup key={g} className={className} group={g} />
            ))}
        </ActiveRowContextWrapper>
    );
}
