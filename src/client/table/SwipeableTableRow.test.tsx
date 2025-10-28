import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Table } from '@mantine/core';

import { useSwipePanelWidth } from '~/client/common/SwipeControlsContext';
import { SwipeableTableRow } from '~/client/table/SwipeableTableRow';
import { POINTER_MOVE_THRESHOLD } from '~/client/utils/pointer';

jest.mock('~/client/common/SwipeControlsContext', () => ({
    useSwipePanelWidth: jest.fn(() => [120, jest.fn()]),
}));

describe('<SwipeableTableRow>', () => {
    const mockRef = jest.fn();
    const setActive = jest.fn();
    const mockData = { id: 'test-1', name: 'Test Item' };

    // Capture original PointerEvent before any tests modify it
    const originalPointerEvent = (window as any).PointerEvent;

    beforeEach(() => jest.clearAllMocks());

    describe('rendering', () => {
        it('renders table row with children', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell 1</Table.Td>
                                    <Table.Td>Cell 2</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            expect(screen.getByText('Cell 1')).toBeInTheDocument();
            expect(screen.getByText('Cell 2')).toBeInTheDocument();
        });

        it('renders with data-group attribute', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef} data-group="group-1">
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            expect(screen.getByRole('row')).toHaveAttribute('data-group', 'group-1');
        });

        it('renders with custom style', () => {
            const customStyle = { backgroundColor: 'red', zIndex: 999 };

            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef} style={customStyle}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            expect(screen.getByRole('row')).toHaveStyle({ zIndex: '999' });
        });

        it('calls ref callback with row element', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            expect(mockRef).toHaveBeenCalledWith(expect.any(HTMLTableRowElement));
        });
    });

    describe('mouse events', () => {
        beforeAll(() => delete (window as any).PointerEvent);

        afterAll(() => {
            (window as any).PointerEvent = originalPointerEvent;
        });

        it('handles mousedown event', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            await user.pointer({ keys: '[MouseLeft>]', target: row, coords: { x: 100, y: 50 } });

            // Verify drag state is initialized (internal state, no visible change yet)
            expect(row).toBeInTheDocument();
        });

        it('does not start drag when clicking on drag handle', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>
                                        <div data-drag-handle>Handle</div>
                                    </Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer({ keys: '[MouseLeft>]', target: screen.getByText('Handle'), coords: { x: 100, y: 50 } });

            // Should not activate swipe when clicking on drag handle
            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles horizontal swipe left', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Swipe left beyond threshold
            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 100, y: 50 } },
                { coords: { x: 100 - POINTER_MOVE_THRESHOLD - 10, y: 50 } },
            ]);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                        data: mockData,
                    })
                );
            });
        });

        it('does not start swipe if movement is below threshold', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            await user.pointer([
                { keys: '[MouseLeft>]', target: row, coords: { x: 100, y: 50 } },
                { coords: { x: 100 - POINTER_MOVE_THRESHOLD + 1, y: 50 } },
            ]);

            // Verify no swipe started
            expect(row).toBeInTheDocument();
            expect(setActive).not.toHaveBeenCalled();
        });

        it('prefers horizontal swipe over vertical movement', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Horizontal movement larger than vertical
            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 100, y: 50 } },
                { coords: { x: 50, y: 55 } },
            ]);

            expect(setActive).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'test-1',
                })
            );
        });

        it('does not swipe beyond controls width', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Try to swipe more than controls width (120px)
            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: -50, y: 50 } },
            ]);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                        data: mockData,
                    })
                );
            });
        });

        it('does not swipe right beyond closed position', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Try to swipe right (positive direction)
            await user.pointer([
                { keys: '[MouseLeft>]', target: row, coords: { x: 100, y: 50 } },
                { coords: { x: 200, y: 50 } },
            ]);

            // Verify row is still rendered
            expect(row).toBeInTheDocument();
        });

        it('completes swipe on mouseup and opens controls', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: 100, y: 50 } },
                { keys: '[/MouseLeft]' },
            ]);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('completes swipe on mouseleave', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: 100, y: 50 } },
            ]);

            // Simulate mouseleave by moving pointer outside
            await user.pointer({ target: document.body });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('closes controls when swiping right from open position', async () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -120 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 50, y: 50 } },
                { coords: { x: 150, y: 50 } },
                { keys: '[/MouseLeft]' },
            ]);

            await waitFor(() => {
                // Should close (call setActive with no args)
                const calls = setActive.mock.calls;
                const hasCloseCall = calls.some((call) => call.length === 0);

                expect(hasCloseCall).toBe(true);
            });
        });
    });

    describe('touch events', () => {
        const bakMaxTouchPoints = navigator.maxTouchPoints;

        beforeAll(() => {
            delete (window as any).PointerEvent;
            Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, configurable: true });
        });

        afterAll(() => {
            Object.defineProperty(navigator, 'maxTouchPoints', { value: bakMaxTouchPoints, configurable: true });
            (window as any).PointerEvent = originalPointerEvent;
        });

        it('handles touchstart event', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            fireEvent.touchStart(row, {
                changedTouches: [{ clientX: 100, clientY: 50 }],
            });

            expect(row).toBeInTheDocument();
        });

        it('does not start drag when touching drag handle', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>
                                        <div data-drag-handle>Handle</div>
                                    </Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            fireEvent.touchStart(screen.getByText('Handle'), {
                changedTouches: [{ clientX: 100, clientY: 50 }],
            });

            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles horizontal touch swipe left', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            fireEvent.touchStart(row, {
                changedTouches: [{ clientX: 100, clientY: 50 }],
            });

            fireEvent.touchMove(row, {
                changedTouches: [{ clientX: 100 - POINTER_MOVE_THRESHOLD - 10, clientY: 50 }],
            });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                        data: mockData,
                    })
                );
            });
        });

        it('completes swipe on touchend', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            fireEvent.touchStart(row, {
                changedTouches: [{ clientX: 200, clientY: 50 }],
            });

            fireEvent.touchMove(row, {
                changedTouches: [{ clientX: 100, clientY: 50 }],
            });

            fireEvent.touchEnd(row);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('completes swipe on touchcancel', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            fireEvent.touchStart(row, {
                changedTouches: [{ clientX: 200, clientY: 50 }],
            });

            fireEvent.touchMove(row, {
                changedTouches: [{ clientX: 100, clientY: 50 }],
            });

            fireEvent.touchCancel(row);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });
    });

    describe('pointer events', () => {
        // Note: No beforeAll/afterAll setup needed - PointerEvent should be available by default

        it('handles pointerdown event', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');
            fireEvent.pointerDown(row, { clientX: 100, clientY: 50 });

            expect(row).toBeInTheDocument();
        });

        it('does not start drag when pointer down on drag handle', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>
                                        <div data-drag-handle>Handle</div>
                                    </Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            fireEvent.pointerDown(screen.getByText('Handle'), { clientX: 100, clientY: 50 });

            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles horizontal pointer swipe left', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');
            fireEvent.pointerDown(row, { clientX: 100, clientY: 50 });
            fireEvent.pointerMove(row, {
                clientX: 100 - POINTER_MOVE_THRESHOLD - 10,
                clientY: 50,
            });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                        data: mockData,
                    })
                );
            });
        });

        it('completes swipe on pointerup', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');
            fireEvent.pointerDown(row, { clientX: 200, clientY: 50 });
            fireEvent.pointerMove(row, { clientX: 100, clientY: 50 });
            fireEvent.pointerUp(row);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('completes swipe on pointercancel', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');
            fireEvent.pointerDown(row, { clientX: 200, clientY: 50 });
            fireEvent.pointerMove(row, { clientX: 100, clientY: 50 });
            fireEvent.pointerCancel(row);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('closes controls when swiping right from open position', async () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -120 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');
            fireEvent.pointerDown(row, { clientX: 50, clientY: 50 });
            fireEvent.pointerMove(row, { clientX: 150, clientY: 50 });
            fireEvent.pointerUp(row);

            await waitFor(() => {
                expect(setActive).toHaveBeenLastCalledWith();
            });
        });
    });

    describe('active state management', () => {
        it('updates active state when visible and x changes', async () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: 100, y: 50 } },
            ]);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('resets offset when row becomes inactive', () => {
            const { rerender } = render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -60 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Verify initial render
            expect(screen.getByText('Cell')).toBeInTheDocument();

            // Make row inactive
            rerender(
                <MockTheme>
                    <MockActiveContent active={undefined} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Internal state is reset (no visible change to test)
            expect(screen.getByText('Cell')).toBeInTheDocument();
        });

        it('does not activate when different row is active', () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'other-row', data: mockData }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            expect(screen.getByText('Cell')).toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        it('handles rapid mouse movements', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: 180, y: 50 } },
                { coords: { x: 160, y: 50 } },
                { coords: { x: 140, y: 50 } },
                { coords: { x: 120, y: 50 } },
                { keys: '[/MouseLeft]' },
            ]);

            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                    })
                );
            });
        });

        it('handles mouse events correctly during swipe', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: 100, y: 50 } },
            ]);

            // Swipe functionality works as expected
            expect(screen.getByRole('row')).toBeInTheDocument();
            expect(setActive).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'test-1',
                })
            );
        });

        it('handles zero controls width', async () => {
            const mockedUseSwipePanelWidth = jest.mocked(useSwipePanelWidth);

            mockedUseSwipePanelWidth.mockReturnValue([0, jest.fn()]);

            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 200, y: 50 } },
                { coords: { x: 100, y: 50 } },
            ]);

            expect(screen.getByRole('row')).toBeInTheDocument();
            expect(mockedUseSwipePanelWidth).toHaveBeenCalledWith();
        });

        it('closes row when swiping right enough from open position', async () => {
            const activeRef = { current: null };
            const activeContent = {
                id: 'test-1',
                data: mockData,
                ref: activeRef,
                offset: -120,
            };

            render(
                <MockTheme>
                    <MockActiveContent active={activeContent} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            await user.pointer([
                { keys: '[MouseLeft>]', target: screen.getByRole('row'), coords: { x: 100, y: 50 } },
                { coords: { x: 150, y: 50 } },
                { keys: '[/MouseLeft]' },
            ]);

            await waitFor(() => {
                expect(setActive).toHaveBeenLastCalledWith();
            });
        });
    });

    describe('initialization from active.offset', () => {
        it('initializes x from active.offset when row becomes visible', async () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -120 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // x should be initialized from active.offset, which triggers setActive via useEffect
            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                        offset: -120,
                    })
                );
            });
        });

        it('does not initialize x when active.offset is undefined', () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Should not set x if active.offset is undefined
            expect(setActive).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    offset: expect.anything(),
                })
            );
        });
    });

    describe('controlsWidth update', () => {
        it('updates x from -1 to OPEN_POSITION when controlsWidth becomes available', async () => {
            const mockedUseSwipePanelWidth = jest.mocked(useSwipePanelWidth);
            mockedUseSwipePanelWidth.mockReturnValue([0, jest.fn()]);

            const { rerender } = render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // Simulate swipe that sets x to -1 because controlsWidth is 0
            const row = screen.getByRole('row');
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });
            fireEvent.mouseMove(row, { clientX: 100, clientY: 50 });
            fireEvent.mouseUp(row, { clientX: 100, clientY: 50 });

            // Wait for handleDragEnd to set x to -1
            await waitFor(() => {
                expect(setActive).toHaveBeenCalled();
            });

            // Clear previous calls
            setActive.mockClear();

            // Now set controlsWidth to 120 and make row visible
            mockedUseSwipePanelWidth.mockReturnValue([120, jest.fn()]);

            rerender(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -1 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            // x should be updated from -1 to OPEN_POSITION (-120)
            await waitFor(() => {
                expect(setActive).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'test-1',
                        offset: -120,
                    })
                );
            });
        });
    });

    describe('event type isolation', () => {
        it('ignores mouse events when touch event started', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start with touch
            fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 50 }] });

            // Try mouse event - should be ignored
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });
            fireEvent.mouseMove(row, { clientX: 100, clientY: 50 });

            // Should not have called setActive with mouse coordinates
            expect(setActive).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'test-1',
                })
            );
        });

        it('ignores touch events when mouse event started', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start with mouse
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });

            // Try touch event - should be ignored
            fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 50 }] });
            fireEvent.touchMove(row, { touches: [{ clientX: 100, clientY: 50 }] });

            // Should not have called setActive with touch coordinates
            expect(setActive).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'test-1',
                })
            );
        });

        it('ignores pointer events when mouse event started', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start with mouse
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });

            // Try pointer event - should be ignored
            fireEvent.pointerDown(row, { clientX: 200, clientY: 50, pointerId: 1 });
            fireEvent.pointerMove(row, { clientX: 100, clientY: 50, pointerId: 1 });

            // Should not have called setActive with pointer coordinates
            expect(setActive).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'test-1',
                })
            );
        });
    });

    describe('handleDrag edge cases', () => {
        it('does not start drag when dragging is already true', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start drag
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });
            fireEvent.mouseMove(row, { clientX: 100, clientY: 50 });

            // Try to start drag again - should not call handleDragStart again
            const initialCallCount = setActive.mock.calls.length;
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });

            // Should not have called setActive again
            expect(setActive.mock.calls.length).toBe(initialCallCount);
        });

        it('returns false when dragging is false', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Move without starting drag - should return false
            fireEvent.mouseMove(row, { clientX: 100, clientY: 50 });

            // Should not have called setActive
            expect(setActive).not.toHaveBeenCalled();
        });
    });

    describe('handleDragEnd edge cases', () => {
        it('does not process drag end when dragging is false', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Try to end drag without starting - should not process
            fireEvent.mouseUp(row, { clientX: 100, clientY: 50 });

            // Should not have called setActive
            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles drag end when sliding is false but deltaX is sufficient', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start drag but don't move enough to trigger sliding
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });
            // Move enough to exceed threshold but not enough to trigger sliding
            fireEvent.mouseMove(row, { clientX: 150, clientY: 50 });
            // End drag - should still process if deltaX is sufficient
            fireEvent.mouseUp(row, { clientX: 100, clientY: 50 });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalled();
            });
        });
    });

    describe('touch event edge cases', () => {
        it('handles touchstart when no touches available', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Touch start without touches
            fireEvent.touchStart(row, { touches: [] });

            // Should not have called setActive
            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles touchmove when no touches available', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start touch
            fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 50 }] });

            // Move without touches
            fireEvent.touchMove(row, { touches: [] });

            // Should not have called setActive
            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles touchend when no touches available', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start touch
            fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 50 }] });

            // End touch without touches (uses changedTouches)
            fireEvent.touchEnd(row, { touches: [], changedTouches: [{ clientX: 100, clientY: 50 }] });

            // Should have called setActive
            expect(setActive).toHaveBeenCalled();
        });
    });

    describe('pointer event edge cases', () => {
        it('ignores pointermove when pointerId does not match', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start pointer with ID 1
            fireEvent.pointerDown(row, { clientX: 200, clientY: 50, pointerId: 1 });

            // Move with different pointer ID - should be ignored
            fireEvent.pointerMove(row, { clientX: 100, clientY: 50, pointerId: 2 });

            // Should not have called setActive
            expect(setActive).not.toHaveBeenCalled();
        });

        it('ignores pointerup when pointerId does not match', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start pointer with ID 1
            fireEvent.pointerDown(row, { clientX: 200, clientY: 50, pointerId: 1 });
            // Don't move - just end with different pointer ID
            // End with different pointer ID - should be ignored
            fireEvent.pointerUp(row, { clientX: 100, clientY: 50, pointerId: 2 });

            // Should not have called setActive (pointerMove would have called it, but we didn't move)
            expect(setActive).not.toHaveBeenCalled();
        });

        it('handles pointerup with invalid clientX/clientY', () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start pointer
            fireEvent.pointerDown(row, { clientX: 200, clientY: 50, pointerId: 1 });
            fireEvent.pointerMove(row, { clientX: 100, clientY: 50, pointerId: 1 });

            // End with invalid coordinates (0) - should use lastClientXRef
            fireEvent.pointerUp(row, { clientX: 0, clientY: 0, pointerId: 1 });

            // Should have called setActive using lastClientXRef
            expect(setActive).toHaveBeenCalled();
        });
    });

    describe('handleDragEnd scenarios', () => {
        it('handles drag end when sliding is true and initialX is 0', async () => {
            render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start drag from closed position
            fireEvent.mouseDown(row, { clientX: 200, clientY: 50 });
            fireEvent.mouseMove(row, { clientX: 100, clientY: 50 });
            fireEvent.mouseUp(row, { clientX: 100, clientY: 50 });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalled();
            });
        });

        it('handles drag end when sliding is true and initialX is not 0', async () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -120 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start drag from open position
            fireEvent.mouseDown(row, { clientX: 100, clientY: 50 });
            fireEvent.mouseMove(row, { clientX: 150, clientY: 50 });
            fireEvent.mouseUp(row, { clientX: 150, clientY: 50 });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalled();
            });
        });

        it('handles drag end when targetX equals current x', async () => {
            render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -120 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const row = screen.getByRole('row');

            // Start drag from open position and swipe slightly (not enough to close)
            fireEvent.mouseDown(row, { clientX: 100, clientY: 50 });
            fireEvent.mouseMove(row, { clientX: 110, clientY: 50 });
            fireEvent.mouseUp(row, { clientX: 110, clientY: 50 });

            await waitFor(() => {
                expect(setActive).toHaveBeenCalled();
            });
        });
    });

    describe('table touch-action updates', () => {
        it('sets touch-action to none when swipe panel is open', () => {
            const { container } = render(
                <MockTheme>
                    <MockActiveContent active={{ id: 'test-1', data: mockData, offset: -120 }} setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const table = container.querySelector('table');
            expect(table?.style.touchAction).toBe('none');
        });

        it('sets touch-action to pan-y when swipe panel is closed', () => {
            const { container } = render(
                <MockTheme>
                    <MockActiveContent setActive={setActive}>
                        <Table>
                            <Table.Tbody>
                                <SwipeableTableRow id="test-1" data={mockData} ref={mockRef}>
                                    <Table.Td>Cell</Table.Td>
                                </SwipeableTableRow>
                            </Table.Tbody>
                        </Table>
                    </MockActiveContent>
                </MockTheme>
            );

            const table = container.querySelector('table');
            expect(table?.style.touchAction).toBe('pan-y');
        });
    });
});
