import { Avatar, Table, Title } from '@mantine/core';
import React from 'react';

import { AnnualIcon, ReviewIcon } from '@icons';

import { Label } from '~/client/common/Label';
import { SortableRow } from '~/client/table/SortableRow';
import type { Group } from '~/types/data';

interface GroupsRowProps {
    group: Group;
    reordering: boolean;
    hidden?: boolean;
}

export function GroupsRow({ group, reordering, hidden = false }: GroupsRowProps): React.ReactElement {
    const annual = group.annual ?? true;
    const review = group.review;
    return (
        <SortableRow id={group.group} data={group} disabled={reordering || hidden} data-hidden={hidden}>
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
