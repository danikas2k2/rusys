import React from 'react';

import { ActiveRowWrapper } from '~/client/app/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/app/common/ActiveRowOutsideClick';
import { ActiveVariantBox } from '~/client/app/variants/ActiveVariantBox';
import { SortableGroup } from '~/client/app/variants/SortableGroup';

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
