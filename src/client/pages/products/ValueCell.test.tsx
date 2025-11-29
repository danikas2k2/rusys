import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Table } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { useProductUpdating } from '~/client/pages/products/UpdatingProductsContext';
import { ValueCell, type ValueCellProps } from '~/client/pages/products/ValueCell';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';

vi.mock('~/client/state/products/useSetProductRemoving', async () => ({
    useSetProductRemoving: vi.fn(),
}));
vi.mock('~/client/common/ActiveContentContext', async () => ({
    ...(await vi.importActual('~/client/common/ActiveContentContext')),
    useActiveContent: vi.fn(),
}));
vi.mock('~/client/pages/products/UpdatingProductsContext', async () => ({
    useProductUpdating: vi.fn(),
}));
vi.mock('~/client/common/hooks/useSwipeVisible', async () => ({
    useSwipeVisible: vi.fn(),
}));

describe('<ValueCell>', () => {
    const group = 'Daržovės';
    const name = 'Kopūstai';
    const variants = [
        { group, variant: 'p', order: 0 },
        { group, variant: 'd', order: 1, suffix: 'd' },
        { group, variant: 'm', order: 2, suffix: 'm' },
    ];

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const setRemoving = vi.fn();
    const setActive = vi.fn();

    beforeEach(() => {
        vi.mocked(useSetProductRemoving).mockReturnValue(setRemoving);
        vi.mocked(useActiveContent).mockReturnValue([undefined, setActive]);
        vi.mocked(useSwipeVisible).mockReturnValue(false);
        vi.mocked(useProductUpdating).mockReturnValue(false);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.clearAllTimers();
        vi.clearAllMocks();
    });

    afterAll(() => vi.useRealTimers());

    const defaultProps: ValueCellProps = { group, name, year: 22 };

    describe('renders filled cell', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 3 },
            ],
        };

        it('renders cell into the document', () => {
            render(
                <MockApp state={{ variants }}>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell', { name: '23d' })).toBeInTheDocument();
        });

        it('handles long press', async () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => vi.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(props.group, props.name, props.year, true);
        });

        it('handles long press when removing is true', async () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} removing />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            const cell = screen.getByRole('cell');
            fireEvent.pointerDown(cell);
            act(() => vi.advanceTimersByTime(500));
            fireEvent.pointerUp(cell);
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(props.group, props.name, props.year, false);
        });

        it('handles short press', async () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.click(screen.getByRole('cell'));
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: props,
            });
            expect(setRemoving).not.toHaveBeenCalled();
        });
    });

    describe('renders empty cell', () => {
        it('renders cell into the document with empty amounts', () => {
            const props: Omit<ValueCellProps, 'onChange'> = { ...defaultProps, amounts: [] };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell', { name: '.' })).toBeInTheDocument();
        });

        it('does not handle long press for empty cell', async () => {
            const props: Omit<ValueCellProps, 'onChange'> = { ...defaultProps, amounts: [] };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => vi.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('handles short press with empty amounts', async () => {
            const props: Omit<ValueCellProps, 'onChange'> = { ...defaultProps, amounts: [] };

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.click(screen.getByRole('cell'));
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: props,
            });
            expect(setRemoving).not.toHaveBeenCalled();
        });
    });

    describe('loader visibility', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [{ variant: 'p', amount: 1 }],
        };

        it('shows loader when updating is true', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toHaveAttribute('data-visible', 'true');
        });

        it('hides loader when updating becomes false and transition ends', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            const { rerender } = render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            vi.mocked(useProductUpdating).mockReturnValue(false);

            rerender(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.transitionEnd(screen.getByRole('progressbar')));

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('does not hide loader when updating is true and transition ends', () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            act(() => fireEvent.transitionEnd(screen.getByRole('progressbar')));

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('span prop', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [{ variant: 'p', amount: 1 }],
            span: 3,
        };

        it('uses span to set year to 0 when span is provided', () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('cell')).toBeInTheDocument();
        });

        it('sets year to 0 in active state when span is provided and cell is clicked', async () => {
            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.click(screen.getByRole('cell'));
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: {
                    ...props,
                    year: 0,
                    span: undefined,
                },
            });
        });
    });

    describe('swipeActive', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [{ variant: 'p', amount: 1 }],
        };

        it('disables interactions when swipeActive is true', async () => {
            vi.mocked(useSwipeVisible).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.click(screen.getByRole('cell'));
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
        });
    });

    describe('updating', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [{ variant: 'p', amount: 1 }],
        };

        it('disables interactions when updating is true', async () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.click(screen.getByRole('cell'));
            act(() => vi.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
        });

        it('disables long press when updating is true', async () => {
            vi.mocked(useProductUpdating).mockReturnValue(true);

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => vi.advanceTimersByTime(500));

            expect(setRemoving).not.toHaveBeenCalled();
            expect(setActive).not.toHaveBeenCalled();
        });
    });

    describe('navigator.vibrate', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [{ variant: 'p', amount: 1 }],
        };

        const originalNavigator = globalThis.navigator;
        const mockVibrate = vi.fn();

        afterEach(() =>
            Object.defineProperty(globalThis, 'navigator', {
                value: originalNavigator,
                writable: true,
                configurable: true,
            })
        );

        it('calls navigator.vibrate when available and long press is triggered', async () => {
            Object.defineProperty(globalThis, 'navigator', {
                value: { vibrate: mockVibrate },
                writable: true,
                configurable: true,
            });

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => vi.advanceTimersByTime(500));

            expect(mockVibrate).toHaveBeenCalledWith(500);
        });

        it('does not call vibrate when navigator is undefined', async () => {
            Object.defineProperty(globalThis, 'navigator', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => vi.advanceTimersByTime(500));

            expect(mockVibrate).not.toHaveBeenCalled();
        });

        it('does not call vibrate when navigator.vibrate is undefined', async () => {
            Object.defineProperty(globalThis, 'navigator', {
                value: {},
                writable: true,
                configurable: true,
            });

            render(
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <ValueCell {...props} />
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            await user.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => vi.advanceTimersByTime(500));

            expect(mockVibrate).not.toHaveBeenCalled();
        });
    });
});
