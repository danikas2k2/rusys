import React from 'react';

import { useVariant } from '~/client/state/variants/useVariant';

interface ValueSuffixProps {
    group: string;
    variant: string;
}

export function ValueSuffix({ group, variant }: ValueSuffixProps) {
    const value = useVariant(group, variant);
    return <sub>{value ? value.suffix : variant}</sub>;
}
