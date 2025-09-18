import React from 'react';

import { useVariant } from '~/state/variants/useVariant';

interface ValueSuffixProps {
    group: string;
    variant: string;
}

export function ValueSuffix({ group, variant }: ValueSuffixProps) {
    const details = useVariant(group, variant);
    return <sub>{details ? details.suffix : variant}</sub>;
}
