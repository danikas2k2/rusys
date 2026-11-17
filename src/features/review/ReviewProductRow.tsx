import { Checkbox, Group, Table, Title } from '@mantine/core';
import React, { useCallback } from 'react';

import { ProductAvatar } from '~/features/products/ProductAvatar';
import { UntouchedCheckboxIcon } from '~/features/review/UntouchedCheckboxIcon';
import { getId } from '~/lib/utils/id';
import type { Product } from '~/schema';

interface ReviewProductRowProps {
    product: Product;
    checked: boolean;
    touched: boolean;
    onToggle: (key: string, checked: boolean) => void;
    hidden?: boolean;
    gridIndex?: number;
    gridRows?: { sm: number; lg: number };
}

export function ReviewProductRow({
    product,
    checked,
    touched,
    onToggle,
    hidden = false,
    gridIndex = 0,
    gridRows,
}: ReviewProductRowProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onToggle(getId(product.group, product.name), e.currentTarget.checked);
        },
        [onToggle, product.group, product.name]
    );

    return (
        <Table.Tr
            data-hidden={hidden}
            data-grid-row-sm={gridRows ? gridIndex % gridRows.sm !== 0 : undefined}
            data-grid-row-lg={gridRows ? gridIndex % gridRows.lg !== 0 : undefined}
        >
            <Table.Td>
                <Checkbox
                    variant="outline"
                    checked={checked}
                    icon={touched ? undefined : UntouchedCheckboxIcon}
                    onChange={handleChange}
                    data-untouched={!touched}
                    label={
                        <Group gap="xs" wrap="nowrap">
                            <ProductAvatar image={product.image} label={product.name} size="sm" />
                            <Title order={5}>{product.name}</Title>
                        </Group>
                    }
                />
            </Table.Td>
        </Table.Tr>
    );
}
