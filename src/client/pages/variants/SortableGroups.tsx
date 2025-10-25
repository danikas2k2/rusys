import React from 'react';

import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { ActiveContentOutsideClick } from '~/client/common/ActiveContentOutsideClick';
import { ActiveVariantBox } from '~/client/pages/variants/ActiveVariantBox';
import { SortableGroup } from '~/client/pages/variants/SortableGroup';

interface SortableVariantsProps {
    className?: string;
    groups: string[];
}

export function SortableGroups({ className, groups }: SortableVariantsProps) {
    return (
        <ActiveContentWrapper>
            <ActiveContentOutsideClick />
            {groups.map((g) => (
                <SortableGroup key={g} className={className} group={g} />
            ))}
            <ActiveVariantBox />
        </ActiveContentWrapper>
    );
}
