import { Text } from '@mantine/core';
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

    if (isAutoKey) {
        return <VariantLabel count={variantData?.count} units={variantData?.units} />;
    }

    const label = variantData?.variant || variant;

    if (variantData?.count) {
        return (
            <>
                {label}
                {/* component="span" - this is itself often rendered inside another Text/<p>, so it
                    can't be Text's own default <p> (invalid nested-<p> HTML). display="block"
                    still puts it on its own line below `label`, same as a real <p> would have. */}
                <Text size="sm" c="dimmed" component="span" display="block">
                    <VariantLabel count={variantData.count} units={variantData.units} />
                </Text>
            </>
        );
    }

    const index = label.trim().indexOf(' ');
    if (index < 0) {
        return <>{label}</>;
    }

    return <VariantLabel count={label.slice(0, index).trim()} units={label.slice(index).trim()} />;
}
