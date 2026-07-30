import { Checkbox, Table } from '@mantine/core';
import React, { useCallback } from 'react';

import { UntouchedCheckboxIcon } from '~/client/pages/review/UntouchedCheckboxIcon';
import { getId } from '~/client/utils/id';
import type { Product } from '~/types/data';

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
                    label={product.name}
                />
            </Table.Td>
        </Table.Tr>
    );
}
