import React from 'react';

import { Table } from '@mantine/core';

import { MockApp } from './MockApp';

export function MockTableRow({ children }: React.PropsWithChildren): React.ReactElement {
    return (
        <MockApp>
            <Table>
                <Table.Tbody>
                    <Table.Tr>{children}</Table.Tr>
                </Table.Tbody>
            </Table>
        </MockApp>
    );
}
