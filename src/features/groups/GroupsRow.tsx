import { Avatar, Table, Title } from '@mantine/core';
import React from 'react';

import { AnnualIcon, ReviewIcon } from '@icons';

import type { Group } from '~/common/data';
import { Label } from '~/components/common/Label';
import { useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { SortableRow } from '~/components/table/SortableRow';

interface GroupsRowProps {
    group: Group;
    reordering: boolean;
    dragDisabled?: boolean;
    hidden?: boolean;
}

export function GroupsRow({
    group,
    reordering,
    dragDisabled = false,
    hidden = false,
}: GroupsRowProps): React.ReactElement {
    const annual = group.annual ?? true;
    const review = group.review;
    const setActive = useSetActiveContent<Group>();
    const handleEdit = (event: React.MouseEvent | React.KeyboardEvent) => {
        if ((event.target as HTMLElement).closest('[data-drag-handle]')) {
            return;
        }
        if ('key' in event && event.key !== 'Enter' && event.key !== ' ') {
            return;
        }
        event.preventDefault();
        setActive({ action: 'update', data: group });
    };

    return (
        <SortableRow
            id={group.group}
            data={group}
            disabled={reordering || dragDisabled || hidden}
            swipeable={false}
            data-hidden={hidden}
            data-editable
            tabIndex={hidden ? -1 : 0}
            onClick={handleEdit}
            onKeyDown={handleEdit}
        >
            <Table.Td>
                {group.image && (
                    <Avatar src={group.image} radius="sm" size="sm" alt={group.group}>
                        {group.group.trim().charAt(0).toUpperCase()}
                    </Avatar>
                )}
            </Table.Td>
            <Table.Td colSpan={annual ? undefined : review ? 2 : 3}>
                <Title order={5}>
                    <Label>{group.group}</Label>
                </Title>
            </Table.Td>
            {annual && (
                <Table.Td ta="center">
                    <AnnualIcon size={18} />
                </Table.Td>
            )}
            {(annual || review) && <Table.Td ta="center">{review && <ReviewIcon size={18} />}</Table.Td>}
        </SortableRow>
    );
}
