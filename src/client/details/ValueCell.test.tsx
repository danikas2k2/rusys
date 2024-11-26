import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';
import { ValueBox } from '~/client/details/dialogs/ValueBox';
import { ValueCell, type ValueCellProps } from '~/client/details/ValueCell';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/details/dialogs/ValueBox', () => ({
    ValueBox: jest.fn().mockReturnValue(null),
}));
jest.mock('~/state/details/useSetDetailsRemoving', () => ({
    useSetDetailsRemoving: jest.fn(),
}));
jest.mock('~/state/details/useUpdateDetails', () => ({
    useUpdateDetails: jest.fn(),
}));

describe('ValueCell', () => {
    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const setRemoving = jest.fn();
    const updateDetails = jest.fn();

    beforeAll(() => {
        (useSetDetailsRemoving as jest.Mock).mockReturnValue(setRemoving);
        (useUpdateDetails as jest.Mock).mockReturnValue(updateDetails);
    });

    beforeEach(() => jest.useFakeTimers());

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

    const defaultProps: ValueCellProps = {
        group: 'Daržovės',
        name: 'Kopūstai',
        year: 22,
    };

    describe('renders filled cell', () => {
        const props: ValueCellProps = {
            ...defaultProps,
            amounts: [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 3 },
            ],
        };

        it('renders cell into the document', () => {
            render(<ValueCell {...props} />, withReduxState());
            expect(screen.getByRole('cell', { name: '2 p 3 d' })).toBeInTheDocument();
        });

        it('handles long press', async () => {
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));
            expect(ValueBox).not.toHaveBeenCalled();
            expect(setRemoving).toHaveBeenCalledWith(props.group, props.name, props.year, true);
        });

        it('handles short press when not editing', async () => {
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            expect(ValueBox).toHaveBeenCalledWith(expect.objectContaining(props), {});
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls onClose with changed value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => (
                <button
                    onClick={() =>
                        onClose([
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
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).toHaveBeenCalledWith('Daržovės', 'Kopūstai', 22, [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 1 },
                { variant: 'm', amount: -1 },
            ]);
        });

        it('calls onClose with unchanged value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => (
                <button onClick={() => onClose()}>ValueBox</button>
            ));
            render(<ValueCell {...props} />, withReduxState());
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
            render(<ValueCell {...props} />, withReduxState());
            expect(screen.getByRole('cell', { name: '.' })).toBeInTheDocument();
        });

        it('does not handle long press for empty cell', async () => {
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));
            expect(ValueBox).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('handles short press when not editing', async () => {
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            expect(ValueBox).toHaveBeenCalledWith(expect.objectContaining(props), {});
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls onClose with changed value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => (
                <button
                    onClick={() =>
                        onClose([
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
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).toHaveBeenCalledWith('Daržovės', 'Kopūstai', 22, [
                { variant: 'p', amount: 2 },
                { variant: 'd', amount: 1 },
                { variant: 'm', amount: -1 },
            ]);
        });

        it('calls onClose with unchanged value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => (
                <button onClick={() => onClose()}>ValueBox</button>
            ));
            render(<ValueCell {...props} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(updateDetails).not.toHaveBeenCalled();
        });
    });
});
