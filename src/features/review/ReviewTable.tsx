import { Checkbox, Table, Title } from '@mantine/core';
import { isEmpty } from 'lodash';
import React from 'react';

import { useQuickFilterPredicate } from '~/features/filters/hooks/useQuickFilterPredicate';
import { ReviewProductRow } from '~/features/review/ReviewProductRow';
import { UntouchedCheckboxIcon } from '~/features/review/UntouchedCheckboxIcon';
import { getId } from '~/lib/utils/id';
import { useProducts } from '~/store/products';

import './ReviewTable.css';

interface ReviewTableProps {
    group: string;
    touched: boolean;
    checkedKeys: ReadonlySet<string>;
    onToggle: (key: string, checked: boolean) => void;
    onSelectAll: (keys: readonly string[], checked: boolean) => void;
    onReset: (keys: readonly string[]) => void;
}

export function ReviewTable({ group, touched, checkedKeys, onToggle, onSelectAll, onReset }: ReviewTableProps) {
    const quickFilter = useQuickFilterPredicate();

    // Nothing to physically confirm for a product with no recorded stock at all.
    const products = useProducts().filter((p) => p.group === group && !isEmpty(p.years));
    const keys = products.map((p) => getId(p.group, p.name));

    const checkedCount = keys.filter((key) => checkedKeys.has(key)).length;
    const allChecked = touched && keys.length > 0 && checkedCount === keys.length;
    const mixed = touched && checkedCount > 0 && checkedCount < keys.length;

    const handleMasterToggle = () => {
        if (touched && allChecked) {
            // all checked -> untouched
            onReset(keys);
        } else if (touched && !mixed) {
            // all unchecked -> all checked
            onSelectAll(keys, true);
        } else {
            // untouched -> all unchecked, or mixed -> all unchecked
            onSelectAll(keys, false);
        }
    };

    return (
        <Table layout="fixed" data-table="review">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>
                        <Checkbox
                            variant="outline"
                            checked={allChecked}
                            indeterminate={mixed}
                            icon={touched ? undefined : UntouchedCheckboxIcon}
                            onChange={handleMasterToggle}
                            data-untouched={!touched}
                            label={<Title order={3}>{group}</Title>}
                        />
                    </Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {products.map((p) => (
                    <ReviewProductRow
                        key={getId(p.group, p.name)}
                        product={p}
                        checked={checkedKeys.has(getId(p.group, p.name))}
                        touched={touched}
                        onToggle={onToggle}
                        hidden={!quickFilter(p.name)}
                    />
                ))}
            </Table.Tbody>
        </Table>
    );
}
