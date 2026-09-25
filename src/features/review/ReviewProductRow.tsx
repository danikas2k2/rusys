import { Checkbox, Group, Table, Title } from '@mantine/core';
import type { Product } from '@rusys/common/data';
import React, { useCallback } from 'react';

import { ProductAvatar } from '~/features/products/ProductAvatar';
import { UntouchedCheckboxIcon } from '~/features/review/UntouchedCheckboxIcon';
import { getId } from '~/lib/utils/id';

interface ReviewProductRowProps {
    product: Product;
    checked: boolean;
    touched: boolean;
    onToggle: (key: string, checked: boolean) => void;
    hidden?: boolean;
}

export function ReviewProductRow({ product, checked, touched, onToggle, hidden = false }: ReviewProductRowProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onToggle(getId(product.group, product.name), e.currentTarget.checked);
        },
        [onToggle, product.group, product.name]
    );

    return (
        <Table.Tr data-hidden={hidden}>
            <Table.Td>
                <Checkbox
                    variant="outline"
                    checked={checked}
                    icon={touched ? undefined : UntouchedCheckboxIcon}
                    onChange={handleChange}
                    data-untouched={!touched}
                    label={
                        <Group gap="xs" wrap="nowrap">
                            <ProductAvatar image={product.image} label={product.name} />
                            <Title order={5}>{product.name}</Title>
                        </Group>
                    }
                />
            </Table.Td>
        </Table.Tr>
    );
}
