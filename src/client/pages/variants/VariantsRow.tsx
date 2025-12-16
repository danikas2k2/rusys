import { Table, Title } from '@mantine/core';
import React from 'react';

import { Label } from '~/client/common/Label';
import { SortableRow } from '~/client/table/SortableRow';
import { getId } from '~/client/utils/id';
import type { Variant } from '~/types/data';

interface VariantsRowProps {
    variant: Readonly<Variant>;
    reordering: boolean;
    hidden?: boolean;
}

export function VariantsRow({ variant, reordering, hidden = false }: VariantsRowProps): React.ReactElement {
    return (
        <SortableRow
            id={getId(variant.group, variant.variant)}
            data={variant}
            data-group={variant.group}
            disabled={reordering || hidden}
            data-hidden={hidden}
        >
            <Table.Td>
                <Title order={5} data-unused={!variant.used}>
                    <Label>{variant.variant}</Label>
                </Title>
            </Table.Td>
            <Table.Td ta="center">
                <Label>{variant.suffix ?? ''}</Label>
            </Table.Td>
        </SortableRow>
    );
}
