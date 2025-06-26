import React from 'react';
import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockRedux } from '@tests/MockRedux';
import { ValueBox } from '~/client/details/dialogs/ValueBox';
import { ValueCell, type ValueCellProps } from '~/client/details/ValueCell';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';

jest.mock('~/client/details/dialogs/ValueBox', () => ({
    ValueBox: jest.fn().mockReturnValue(null),
}));
jest.mock('~/state/details/useSetDetailsRemoving', () => ({
    useSetDetailsRemoving: jest.fn(),
}));
jest.mock('~/state/details/useUpdateDetails', () => ({
    useUpdateDetails: jest.fn(),
}));

describe('<ValueCell>', () => {
    const group = 'Daržovės';
    const name = 'Kopūstai';
    const variants = [
        { group, variant: 'p', order: 0 },
        { group, variant: 'd', order: 1, suffix: 'd' },
        { group, variant: 'm', order: 2, suffix: 'm' },
    ];
    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const setRemoving = jest.fn();
    const updateDetails = jest.fn();

    beforeAll(() => {
        jest.mocked(useSetDetailsRemoving).mockReturnValue(setRemoving);
        jest.mocked(useUpdateDetails).mockReturnValue(updateDetails);
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
                <MockRedux state={{ variants }}>
                    <ValueCell {...props} />
                </MockRedux>
            );

            expect(screen.getByRole('cell', { name: '2 3 d' })).toBeInTheDocument();
        });

        it('handles long press', async () => {
            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));

            expect(ValueBox).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(props.group, props.name, props.year, true);
        });

        it('handles short press when not editing', async () => {
            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

            expect(ValueBox).toHaveBeenCalledWith(expect.objectContaining(props), undefined);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls onClose with changed value', async () => {
            jest.mocked(ValueBox).mockImplementation(({ onClose }) => (
                <button
                    onClick={() =>
                        onClose?.([
                            { variant: 'p', amount: 2 },
                            { variant: 'd', amount: 1 },
                            { variant: 'm', amount: -1 },
                            { variant: 'x', amount: 0 },
                        ])
                    }
                >
                    ValueBox
                </button>
            ));

            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));

            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).toHaveBeenCalledWith(group, name, 22, [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 1 },
                { variant: 'm', amount: -1 },
            ]);
        });

        it('calls onClose with unchanged value', async () => {
            jest.mocked(ValueBox).mockImplementation(({ onClose }) => (
                <button onClick={() => onClose?.()}>ValueBox</button>
            ));

            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));

            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).not.toHaveBeenCalled();
        });
    });

    describe('renders empty cell', () => {
        const props: Omit<ValueCellProps, 'onChange'> = { ...defaultProps, amounts: [] };

        it('renders cell into the document', () => {
            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            expect(screen.getByRole('cell', { name: '.' })).toBeInTheDocument();
        });

        it('does not handle long press for empty cell', async () => {
            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));

            expect(ValueBox).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('handles short press when not editing', async () => {
            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));

            expect(ValueBox).toHaveBeenCalledWith(expect.objectContaining(props), undefined);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls onClose with changed value', async () => {
            jest.mocked(ValueBox).mockImplementation(({ onClose }) => (
                <button
                    onClick={() =>
                        onClose?.([
                            { variant: 'p', amount: 2 },
                            { variant: 'd', amount: 1 },
                            { variant: 'm', amount: -1 },
                            { variant: 'x', amount: 0 },
                        ])
                    }
                >
                    ValueBox
                </button>
            ));

            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));

            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).toHaveBeenCalledWith(group, name, 22, [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 1 },
                { variant: 'm', amount: -1 },
            ]);
        });

        it('calls onClose with unchanged value', async () => {
            jest.mocked(ValueBox).mockImplementation(({ onClose }) => (
                <button onClick={() => onClose?.()}>ValueBox</button>
            ));

            render(
                <MockRedux>
                    <ValueCell {...props} />
                </MockRedux>
            );

            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));

            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).not.toHaveBeenCalled();
        });
    });
});
