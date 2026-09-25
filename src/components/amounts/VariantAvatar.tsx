import { Avatar, type AvatarProps } from '@mantine/core';
import type { Variant } from '@rusys/common/data';
import { formatQuarter, formatVolume, formatWeight } from '@rusys/common/utils/amounts';
import React from 'react';

import { useVariant } from '~/store/variants/useVariant';

export interface VariantAvatarProps extends Pick<AvatarProps, 'size'> {
    group: string;
    variant: string;
}

function getCountLabel({ count, units }: Pick<Variant, 'count' | 'units'>): string | undefined {
    if (count == null || count <= 0) {
        return undefined;
    }
    if (units === 'l') {
        const formatted = formatVolume(count * 1000);
        return formatted.value;
    }
    if (units === 'ml') {
        const formatted = formatVolume(count);
        return formatted.value;
    }
    if (units === 'kg') {
        const formatted = formatWeight(count * 1000);
        return formatted.value;
    }
    if (units === 'g') {
        const formatted = formatWeight(count);
        return formatted.value;
    }
    return formatQuarter(count);
}

export function VariantAvatar({ group, variant, size = 'sm' }: VariantAvatarProps): React.ReactElement {
    const value = useVariant(group, variant);
    const label = value?.suffix || (value ? getCountLabel(value) : undefined) || variant;

    return (
        <Avatar
            variant="outline"
            color="gray"
            radius="50%"
            size={size}
            p={0}
            aria-hidden="true"
            styles={{
                placeholder: { padding: 0, fontSize: 'var(--mantine-font-size-sm)', fontWeight: 600, lineHeight: 1 },
            }}
        >
            {label}
        </Avatar>
    );
}
