import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Table } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useActiveSwipe } from '~/client/hooks/useActiveSwipe';
import { useDetailsUpdating } from '~/client/pages/details/UpdatingDetailsContext';
import { ValueCell, type ValueCellProps } from '~/client/pages/details/ValueCell';
import { useSetDetailsRemoving } from '~/client/state/details/useSetDetailsRemoving';

jest.mock('~/client/state/details/useSetDetailsRemoving', () => ({
    useSetDetailsRemoving: jest.fn(),
}));
jest.mock('~/client/common/ActiveContentContext', () => ({
    ...jest.requireActual('~/client/common/ActiveContentContext'),
    useActiveContent: jest.fn(),
}));
jest.mock('~/client/pages/details/UpdatingDetailsContext', () => ({
    useDetailsUpdating: jest.fn(),
}));
jest.mock('~/client/hooks/useActiveSwipe', () => ({
    useActiveSwipe: jest.fn(),
}));

describe('<ValueCell>', () => {
    const group = 'Daržovės';
    const name = 'Kopūstai';
    const variants = [
        { group, variant: 'p', order: 0 },
        { group, variant: 'd', order: 1, suffix: 'd' },
        { group, variant: 'm', order: 2, suffix: 'm' },
    ];
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const setRemoving = jest.fn();
    const setActive = jest.fn();

    beforeAll(() => {
        jest.mocked(useSetDetailsRemoving).mockReturnValue(setRemoving);
        jest.mocked(useActiveContent).mockReturnValue([undefined, setActive]);
        jest.mocked(useDetailsUpdating).mockReturnValue(false);
        jest.mocked(useActiveSwipe).mockReturnValue(false);
    });

    beforeEach(() => jest.useFakeTimers());

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

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
            act(() => jest.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(props.group, props.name, props.year, true);
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
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).toHaveBeenCalledWith({
                action: 'values',
                data: props,
            });
            expect(setRemoving).not.toHaveBeenCalled();
        });
    });

    describe('renders empty cell', () => {
        const props: Omit<ValueCellProps, 'onChange'> = { ...defaultProps, amounts: [] };

        it('renders cell into the document', () => {
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
            act(() => jest.advanceTimersByTime(500));

            expect(setActive).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
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
            act(() => jest.advanceTimersByTime(100));

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
            jest.mocked(useDetailsUpdating).mockReturnValue(true);

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
            jest.mocked(useDetailsUpdating).mockReturnValue(true);

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

            jest.mocked(useDetailsUpdating).mockReturnValue(false);

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
            jest.mocked(useDetailsUpdating).mockReturnValue(true);

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
            act(() => jest.advanceTimersByTime(100));

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
            jest.mocked(useActiveSwipe).mockReturnValue(true);

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
            act(() => jest.advanceTimersByTime(100));

            expect(setActive).not.toHaveBeenCalled();
        });
    });

    describe('navigator.vibrate', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [{ variant: 'p', amount: 1 }],
        };

        const originalNavigator = global.navigator;
        const mockVibrate = jest.fn();

        afterEach(() =>
            Object.defineProperty(global, 'navigator', {
                value: originalNavigator,
                writable: true,
                configurable: true,
            })
        );

        it('calls navigator.vibrate when available and long press is triggered', async () => {
            Object.defineProperty(global, 'navigator', {
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
            act(() => jest.advanceTimersByTime(500));

            expect(mockVibrate).toHaveBeenCalledWith(500);
        });

        it('does not call vibrate when navigator is undefined', async () => {
            Object.defineProperty(global, 'navigator', {
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
            act(() => jest.advanceTimersByTime(500));

            expect(mockVibrate).not.toHaveBeenCalled();
        });

        it('does not call vibrate when navigator.vibrate is undefined', async () => {
            Object.defineProperty(global, 'navigator', {
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
            act(() => jest.advanceTimersByTime(500));

            expect(mockVibrate).not.toHaveBeenCalled();
        });
    });
});
