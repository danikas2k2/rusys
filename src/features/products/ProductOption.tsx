import { Group, type ComboboxItem } from '@mantine/core';
import React from 'react';

import { ProductAvatar } from '~/features/products/ProductAvatar';

interface ProductOptionProps {
    option: ComboboxItem;
    image?: string;
    depth?: number;
}

export function ProductOption({ option, image, depth = 0 }: ProductOptionProps): React.ReactElement {
    return (
        <Group gap="xs" wrap="nowrap" style={{ paddingInlineStart: depth * 16 }}>
            <ProductAvatar image={image} label={option.label} />
            <span data-product-label>{option.label}</span>
        </Group>
    );
}
