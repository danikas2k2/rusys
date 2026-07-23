import React from 'react';

import { VariantLabel } from '~/client/common/VariantLabel';
import { useVariant } from '~/client/state/variants/useVariant';
import { DEFAULT_UNITS, deriveVariantKey } from '~/client/utils/deriveVariantKey';

interface VariantTitleProps {
    group: string;
    variant: string;
}

export function VariantTitle({ group, variant }: VariantTitleProps) {
    const variantData = useVariant(group, variant);
    const isAutoKey =
        !!variantData?.count && variant === deriveVariantKey(variantData.count, variantData.units ?? DEFAULT_UNITS);

    if (!variantData?.name && isAutoKey) {
        return <VariantLabel count={variantData?.count} units={variantData?.units} />;
    }

    const label = variantData?.name || variantData?.variant || variant;
    const index = label.trim().indexOf(' ');
    if (index < 0) {
        return <>{label}</>;
    }

    return <VariantLabel count={label.slice(0, index).trim()} units={label.slice(index).trim()} />;
}
