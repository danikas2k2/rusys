import React from 'react';

import { Table, Title } from '@mantine/core';

import { Label } from '~/client/common/Label';
import { SortableRow } from '~/client/table/SortableRow';
import type { Variant, WithId } from '~/types/data';
import cx from './VariantsRow.pcss';

interface VariantsRowProps {
    variant: WithId<Variant>;
    reordering: boolean;
}

export function VariantsRow({ variant, reordering }: VariantsRowProps): React.ReactElement {
    return (
        <SortableRow id={variant.id} data={variant} data-group={variant.group} disabled={reordering}>
            <Table.Td className={cx('name')}>
                <Title order={6} className={cx({ unused: !variant.used })}>
                    <Label>{variant.variant}</Label>
                </Title>
            </Table.Td>
            <Table.Td ta="center">
                <Label>{variant.suffix ?? ''}</Label>
            </Table.Td>
        </SortableRow>
    );
}
