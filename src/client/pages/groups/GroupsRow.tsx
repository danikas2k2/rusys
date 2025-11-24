import React from 'react';

import { Table, Title } from '@mantine/core';
import { IconCalendarClock } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';
import { SortableRow } from '~/client/table/SortableRow';
import type { Group } from '~/types/data';

export function GroupsRow({ group, reordering }: { group: Group; reordering: boolean }): React.ReactElement {
    return (
        <SortableRow id={group.group} data={group} disabled={reordering}>
            <Table.Td>
                <Title order={6}>
                    <Label>{group.group}</Label>
                </Title>
            </Table.Td>
            <Table.Td ta="center">{(group.annual ?? true) && <IconCalendarClock size={18} />}</Table.Td>
        </SortableRow>
    );
}
