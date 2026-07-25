import { Table, Title } from '@mantine/core';
import React from 'react';

import { Label } from '~/client/common/Label';
import { VariantTitle } from '~/client/common/VariantTitle';
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
                    <VariantTitle group={variant.group} variant={variant.variant} />
                </Title>
            </Table.Td>
            <Table.Td ta="center">
                <Label>{variant.suffix ?? ''}</Label>
            </Table.Td>
        </SortableRow>
    );
}
