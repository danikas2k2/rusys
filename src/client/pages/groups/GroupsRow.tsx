import { Avatar, Table, Title } from '@mantine/core';
import { IconCalendarClock, IconClipboardList } from '@tabler/icons-react';
import React from 'react';

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
            <Table.Td>{group.image && <Avatar src={group.image} radius="sm" size="sm" alt="" />}</Table.Td>
            <Table.Td colSpan={annual ? undefined : review ? 2 : 3}>
                <Title order={5}>
                    <Label>{group.group}</Label>
                </Title>
            </Table.Td>
            {annual && (
                <Table.Td ta="center">
                    <IconCalendarClock size={18} />
                </Table.Td>
            )}
            {(annual || review) && <Table.Td ta="center">{review && <IconClipboardList size={18} />}</Table.Td>}
        </SortableRow>
    );
}
