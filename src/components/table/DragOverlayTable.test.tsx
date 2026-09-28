import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { DragOverlayTable } from './DragOverlayTable';

describe('<DragOverlayTable>', () => {
    it('renders table with children', () => {
        render(
            <MockTheme>
                <DragOverlayTable columns={[]}>
                    <Table.Tr>
                        <Table.Td>Cell 1</Table.Td>
                        <Table.Td>Cell 2</Table.Td>
                    </Table.Tr>
                </DragOverlayTable>
            </MockTheme>
        );

        const table = screen.getByRole('table');

        expect(table).toHaveAttribute('data-drag-overlay');
        // Table has cells with correct content
        expect(screen.getAllByRole('cell')).toHaveListWithTextContent(['Cell 1', 'Cell 2']);
        // But no cols rendered with empty columns prop
        expect(table.querySelector('col')).not.toBeInTheDocument();
    });

    it('renders colgroup with column widths when columns provided', () => {
        render(
            <MockTheme>
                <DragOverlayTable columns={[100, 200, 300]}>
                    <Table.Tr>
                        <Table.Td>Cell 1</Table.Td>
                        <Table.Td>Cell 2</Table.Td>
                        <Table.Td>Cell 3</Table.Td>
                    </Table.Tr>
                </DragOverlayTable>
            </MockTheme>
        );

        const cols = screen.getByRole('table').querySelectorAll('col');

        expect(cols).toHaveLength(3);
        expect(cols[0]).toHaveStyle({ width: '100px' });
        expect(cols[1]).toHaveStyle({ width: '200px' });
        expect(cols[2]).toHaveStyle({ width: '300px' });
    });
});
