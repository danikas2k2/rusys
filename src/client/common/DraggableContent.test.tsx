import { act, render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import { type UniqueIdentifier } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React from 'react';

import { DraggableContent } from './DraggableContent';

let lastDndContextProps: Record<string, unknown> | null = null;

vi.mock(import('@dnd-kit/core'), async (): Promise<any> => {
    const ReactActual = await vi.importActual<typeof React>('react');

    return {
        // runtime values only (types are erased)
        closestCenter: 'closestCenter',
        KeyboardCode: {
            Down: 'ArrowDown',
            Up: 'ArrowUp',
            Left: 'ArrowLeft',
            Right: 'ArrowRight',
            Enter: 'Enter',
            Space: 'Space',
            Esc: 'Escape',
        },
        KeyboardSensor: 'KeyboardSensor',
        PointerSensor: 'PointerSensor',
        useSensor: (sensor: unknown, options: unknown) => ({ sensor, options }),
        useSensors: (...sensors: unknown[]) => sensors,
        DndContext: (props: any) => {
            lastDndContextProps = props;
            return ReactActual.createElement('div', { 'data-testid': 'dnd-context' }, props.children);
        },
        DragOverlay: (props: any) =>
            ReactActual.createElement('div', { 'data-testid': 'drag-overlay' }, props.children),
    };
});

describe('<DraggableContent>', () => {
    afterEach(() => {
        lastDndContextProps = null;
    });

    it('renders children', () => {
        render(
            <MockTheme>
                <DraggableContent>
                    <div>Child 1</div>
                    <div>Child 2</div>
                </DraggableContent>
            </MockTheme>
        );

        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('wires DndContext configuration (collision detection, modifiers, sensors)', () => {
        const onDragStart = vi.fn();
        const onDragEnd = vi.fn();

        render(
            <MockTheme>
                <DraggableContent onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div>Content</div>
                </DraggableContent>
            </MockTheme>
        );

        expect(lastDndContextProps).toStrictEqual(expect.any(Object));

        expect(lastDndContextProps?.collisionDetection).toBe('closestCenter');

        expect(lastDndContextProps?.modifiers).toStrictEqual([restrictToVerticalAxis, restrictToParentElement]);

        // Sensors config comes from useSensor/useSensors (mocked above)
        expect(lastDndContextProps?.sensors).toStrictEqual([
            { sensor: 'PointerSensor', options: { activationConstraint: { distance: 8 } } },
            { sensor: 'KeyboardSensor', options: { coordinateGetter: sortableKeyboardCoordinates } },
        ]);
    });

    it('onDragStart: calls callback and shows DragOverlay with measured column widths', () => {
        const renderDragOverlay = vi.fn((activeId: UniqueIdentifier, columnWidths: number[]) => (
            <div>
                Overlay: {activeId} / widths: {columnWidths.join(',')}
            </div>
        ));

        const onDragStart = vi.fn();
        const onDragEnd = vi.fn();

        render(
            <MockTheme>
                <DraggableContent onDragStart={onDragStart} onDragEnd={onDragEnd} renderDragOverlay={renderDragOverlay}>
                    <table>
                        <tbody>
                            <tr data-id="item-1">
                                <td>Cell 1</td>
                                <td>Cell 2</td>
                            </tr>
                        </tbody>
                    </table>
                </DraggableContent>
            </MockTheme>
        );

        expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument();

        const row = document.querySelector('[data-id="item-1"]');

        expect(row).not.toBeNull();

        const cells = row!.querySelectorAll('th, td');

        expect(cells).toHaveLength(2);

        // JSDOM doesn't calculate layout; fake widths
        (cells[0] as HTMLElement).getBoundingClientRect = vi.fn(() => ({ width: 100 })) as any;
        (cells[1] as HTMLElement).getBoundingClientRect = vi.fn(() => ({ width: 200 })) as any;

        act(() => (lastDndContextProps as any).onDragStart({ active: { id: 'item-1' } }));

        expect(onDragStart).toHaveBeenCalledWith(expect.objectContaining({ active: { id: 'item-1' } }));

        // overlay rendered + renderDragOverlay receives activeId + measured widths
        expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();

        expect(renderDragOverlay).toHaveBeenCalledWith('item-1', [100, 200]);
        expect(screen.getByText(/Overlay: item-1/)).toBeInTheDocument();
        expect(screen.getByText(/widths: 100,200/)).toBeInTheDocument();
        expect(onDragEnd).not.toHaveBeenCalled();
    });

    it('onDragEnd: calls callback and hides DragOverlay', () => {
        const renderDragOverlay = vi.fn((activeId: UniqueIdentifier) => <div>Overlay: {activeId}</div>);

        const onDragStart = vi.fn();
        const onDragEnd = vi.fn();

        render(
            <MockTheme>
                <DraggableContent onDragStart={onDragStart} onDragEnd={onDragEnd} renderDragOverlay={renderDragOverlay}>
                    <div data-id="item-1">Item 1</div>
                </DraggableContent>
            </MockTheme>
        );

        act(() => (lastDndContextProps as any).onDragStart({ active: { id: 'item-1' } }));

        expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();

        act(() => (lastDndContextProps as any).onDragEnd({ active: { id: 'item-1' } }));

        expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ active: { id: 'item-1' } }));
        expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument();
    });

    it('does not render DragOverlay when renderDragOverlay is not provided', () => {
        render(
            <MockTheme>
                <DraggableContent>
                    <div data-id="item-1">Item 1</div>
                </DraggableContent>
            </MockTheme>
        );

        act(() => (lastDndContextProps as any).onDragStart({ active: { id: 'item-1' } }));

        expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument();
    });
});
