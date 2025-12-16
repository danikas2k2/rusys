import { Table } from '@mantine/core';
import React from 'react';

export function GroupTitle({ children, hidden, ...props }: React.ComponentProps<typeof Table.Th>): React.ReactElement {
    return (
        <Table.Tbody data-hidden={hidden}>
            <Table.Tr>
                <Table.Th {...props} data-group-title>
                    {children}
                </Table.Th>
            </Table.Tr>
        </Table.Tbody>
    );
}
