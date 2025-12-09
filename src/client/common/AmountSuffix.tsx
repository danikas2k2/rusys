import React from 'react';

import { useVariant } from '~/client/state/variants/useVariant';

interface AmountSuffixProps {
    group: string;
    variant: string;
}

export function AmountSuffix({ group, variant }: AmountSuffixProps) {
    const value = useVariant(group, variant);
    return <sub>{value ? value.suffix : variant}</sub>;
}
