import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { Table } from '@mantine/core';

import { SortableRow } from '~/client/table/SortableRow';

vi.mock('@dnd-kit/sortable', async () => ({
    useSortable: vi.fn(),
}));

vi.mock('~/client/table/SwipeableTableRow', async () => ({
    SwipeableTableRow: ({ children, style, ref, 'data-group': dataGroup }: any) => (
        <tr ref={ref} data-group={dataGroup} data-style={JSON.stringify(style)}>
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

    const getStyle = (container: HTMLElement) => {
        const element = container.querySelector('[data-style]');

        expect(element).toBeInTheDocument();

        return JSON.parse(element!.getAttribute('data-style')!);
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
        vi.mocked(useSortable).mockReturnValue({
            ...defaultSortableReturn,
            transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
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

        const style = getStyle(container);

        expect(style.transform).toBeDefined();
        expect(style.transition).toBe('transform 200ms ease');
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

        const style = getStyle(container);

        expect(style.backgroundColor).toBe('var(--color-base)');
        expect(style.boxShadow).toBe('var(--shadow-small)');
        expect(style.zIndex).toBe(1);
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

        const style = getStyle(container);

        expect(style.backgroundColor).toBeUndefined();
        expect(style.boxShadow).toBeUndefined();
        expect(style.zIndex).toBeUndefined();
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

        expect(screen.getByRole('button', { name: /drag/i }))
            .toBeInTheDocument()
            .toHaveStyle({ cursor: 'grab' });
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
