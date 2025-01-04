import React from 'react';
import { ActiveRowWrapper } from '~/client/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/common/ActiveRowOutsideClick';
import { ActiveVariantBox } from '~/client/variants/ActiveVariantBox';
import { SortableGroup } from '~/client/variants/SortableGroup';

interface SortableVariantsProps {
    className?: string;
    groups: string[];
}

export function SortableGroups({ className, groups }: SortableVariantsProps) {
    return (
        <ActiveRowWrapper>
            <ActiveRowOutsideClick />
            {groups.map((g) => (
                <SortableGroup key={g} className={className} group={g} />
            ))}
            <ActiveVariantBox />
        </ActiveRowWrapper>
    );
}
