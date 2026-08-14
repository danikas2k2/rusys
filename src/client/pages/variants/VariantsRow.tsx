import { Table, Title } from '@mantine/core';
import React from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { VariantTitle } from '~/client/common/VariantTitle';
import { SortableRow } from '~/client/table/SortableRow';
import { getId } from '~/client/utils/id';
import type { Variant } from '~/types/data';

interface VariantsRowProps {
    variant: Readonly<Variant>;
    reordering: boolean;
    dragDisabled?: boolean;
    hidden?: boolean;
}

function VariantsRowComponent({
    variant,
    reordering,
    dragDisabled = false,
    hidden = false,
}: VariantsRowProps): React.ReactElement {
    const setActive = useSetActiveContent<Variant>();
    const handleEdit = (event: React.MouseEvent | React.KeyboardEvent) => {
        if ((event.target as HTMLElement).closest('[data-drag-handle]')) {
            return;
        }
        if ('key' in event && event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
        event.preventDefault();
        setActive({ action: 'update', data: variant });
    };

    return (
        <SortableRow
            id={getId(variant.group, variant.variant)}
            data={variant}
            data-group={variant.group}
            disabled={reordering || dragDisabled || hidden}
            swipeable={false}
            data-hidden={hidden}
            data-editable
            tabIndex={hidden ? -1 : 0}
            onClick={handleEdit}
            onKeyDown={handleEdit}
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

export const VariantsRow = React.memo(VariantsRowComponent);
