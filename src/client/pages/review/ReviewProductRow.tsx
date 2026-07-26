import { Checkbox, Table, Title } from '@mantine/core';
import React, { useCallback } from 'react';

import { getId } from '~/client/utils/id';
import type { Product } from '~/types/data';

interface ReviewProductRowProps {
    product: Product;
    checked: boolean;
    onToggle: (key: string, checked: boolean) => void;
    hidden?: boolean;
}

export function ReviewProductRow({ product, checked, onToggle, hidden = false }: ReviewProductRowProps) {
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
                    onChange={handleChange}
                    label={<Title order={5}>{product.name}</Title>}
                />
            </Table.Td>
        </Table.Tr>
    );
}
