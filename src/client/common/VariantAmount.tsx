import React from 'react';

import { VariantLabel } from '~/client/common/VariantLabel';
import { useVariant } from '~/client/state/variants/useVariant';

interface VariantAmountProps {
    group: string;
    variant: string;
}

export function VariantAmount({ group, variant }: VariantAmountProps) {
    const variantData = useVariant(group, variant);
    return variantData?.count ? <VariantLabel count={variantData?.count} units={variantData?.units} /> : null;
}
