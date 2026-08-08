import React from 'react';

import { useVariant } from '~/client/state/variants/useVariant';

interface AmountSuffixProps {
    group: string;
    variant: string;
}

export function AmountSuffix({ group, variant }: AmountSuffixProps) {
    const value = useVariant(group, variant);
    const suffix = value ? value.suffix : variant;
    return suffix && <sub>{suffix}</sub>;
}
