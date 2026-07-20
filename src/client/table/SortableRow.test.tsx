import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from '@mantine/core';
import React from 'react';

import { SortableRow } from '~/client/table/SortableRow';

vi.mock(import('@dnd-kit/sortable'), () => ({
    useSortable: vi.fn(),
}));

vi.mock(import('~/client/table/SwipeableRow'), () => ({
    SwipeableRow: ({ children, style, ref, 'data-group': dataGroup, 'data-id': dataId, ...props }: any) => (
        <tr ref={ref} data-group={dataGroup} data-id={dataId} style={style} {...props}>
            {children}
        </tr>
    ),
}));

describe('<SortableRow>', () => {
    const mockSetNodeRef = vi.fn();
    const mockSetActivatorNodeRef = vi.fn();
    const mockData = { id: 'test-1', name: 'Test Item' };

    const defaultSortableReturn = {
        attributes: { role: 'button' },
        listeners: { onClick: vi.fn() },
        setNodeRef: mockSetNodeRef,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        transition: undefined,
        isDragging: false,
        setActivatorNodeRef: mockSetActivatorNodeRef,
    };

    const getRow = (container: HTMLElement) => {
        const row = container.querySelector('tbody tr');

        expect(row).toBeInTheDocument();

        return row as HTMLTableRowElement;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSortable).mockReturnValue(defaultSortableReturn as any);
    });

    it('renders table row with children', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-1" data={mockData}>
                            <Table.Td>Cell 1</Table.Td>
                            <Table.Td>Cell 2</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getAllByRole('cell')).toHaveListWithTextContent(['', 'Cell 1', 'Cell 2']);
    });

    it('passes id to useSortable', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData}>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(useSortable).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-row',
                disabled: undefined,
            })
        );
    });

    it('passes disabled prop to useSortable', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData} disabled>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(useSortable).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
            })
        );
    });

    it('applies transform and transition styles', () => {
        const transform = { x: 10, y: 20, scaleX: 1, scaleY: 1 };
        vi.mocked(useSortable).mockReturnValue({
            ...defaultSortableReturn,
            transform,
            transition: 'transform 200ms ease',
        } as any);

        const { container } = render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData}>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const row = getRow(container);

        expect(row).toHaveStyle({
            transform: CSS.Transform.toString(transform),
            transition: 'transform 200ms ease',
        });
    });

    it('applies dragging styles when isDragging is true', () => {
        vi.mocked(useSortable).mockReturnValue({
            ...defaultSortableReturn,
            isDragging: true,
        } as any);

        const { container } = render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData}>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const row = getRow(container);

        // When dragging, opacity should be 0 (row is hidden, DragOverlay shows it)
        expect(row).toHaveStyle({ opacity: '0' });
    });

    it('does not apply dragging styles when isDragging is false', () => {
        const { container } = render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData}>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const row = getRow(container);

        // SortableRow only sets transform/transition (+ opacity when dragging)
        expect(row).not.toHaveStyle({ opacity: 0 });
    });

    it('passes data-group attribute', () => {
        const { container } = render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData} data-group="Group A">
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(container.querySelector('[data-group="Group A"]')).toBeInTheDocument();
    });

    it('clones default handle with sortable props', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData}>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const dragButton = screen.getByRole('button', { name: /drag/i });

        expect(dragButton).toBeInTheDocument();
        expect(dragButton).toHaveStyle({ cursor: 'grab' });
    });

    it('clones custom handle with sortable props', () => {
        const CustomHandle = React.forwardRef<HTMLTableCellElement>((props, ref) => (
            <td ref={ref} {...props} data-custom="true" />
        ));

        const { container } = render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData} handle={<CustomHandle />}>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const handle = container.querySelector('[data-custom="true"]');

        expect(handle).toBeInTheDocument();
        expect(handle).toHaveAttribute('role', 'button');
    });

    it('does not apply cursor grab style when disabled', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <SortableRow id="test-row" data={mockData} disabled>
                            <Table.Td>Content</Table.Td>
                        </SortableRow>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const handle = screen.getByRole('button', { name: /drag/i });

        expect(handle).not.toHaveStyle({ cursor: 'grab' });
    });
});
