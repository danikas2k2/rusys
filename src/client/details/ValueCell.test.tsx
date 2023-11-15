import { act, render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import React from 'react';
import ValueBox from '~/client/details/dialogs/ValueBox';
import ValueCell from '~/client/details/ValueCell';
import { useUpdateRemoving } from '~/state/removing/useUpdateRemoving';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/details/dialogs/ValueBox', () => jest.fn(() => null));
jest.mock('~/state/removing/useUpdateRemoving', () => ({
    useUpdateRemoving: jest.fn(),
}));

describe('ValueCell', () => {
    const userEvent = UserEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const updateRemoving = jest.fn();

    beforeAll(() => {
        (useUpdateRemoving as jest.Mock).mockReturnValue(updateRemoving);
    });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

    const onChange = jest.fn();
    const defaultValue = {
        group: 'Group',
        name: 'Item',
        year: 22,
    };

    describe('renders filled cell', () => {
        const value = { ...defaultValue, value: { '': 2, d: 3 } };

        it('renders cell into the document', () => {
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            expect(screen.getByRole('cell', { name: '2 3 d' })).toBeInTheDocument();
        });

        it('handles long press', async () => {
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));
            expect(ValueBox).not.toHaveBeenCalled();
            expect(updateRemoving).toHaveBeenCalledWith(value.group, value.name, value.year, true);
        });

        it('handles short press when not editing', async () => {
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            expect(ValueBox).toHaveBeenCalledWith(expect.objectContaining(value), {});
            expect(updateRemoving).not.toHaveBeenCalled();
        });

        it('calls onClose with changed value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => (
                <button onClick={() => onClose({ '': 3, d: 2, m: -1, x: 0 })}>ValueBox</button>
            ));
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(onChange).toHaveBeenCalledWith({ '': 3, d: 2 }, false);
        });

        it('calls onClose with unchanged value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => (
                <button onClick={() => onClose(value.value)}>ValueBox</button>
            ));
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('renders empty cell', () => {
        const value = { ...defaultValue, value: {} };

        it('renders cell into the document', () => {
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            expect(screen.getByRole('cell', { name: '.' })).toBeInTheDocument();
        });

        it('does not handle long press for empty cell', async () => {
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.pointer({ target: screen.getByRole('cell'), keys: `[MouseLeft>]` });
            act(() => jest.advanceTimersByTime(500));
            expect(ValueBox).not.toHaveBeenCalled();
            expect(updateRemoving).not.toHaveBeenCalled();
        });

        it('handles short press when not editing', async () => {
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            expect(ValueBox).toHaveBeenCalledWith(expect.objectContaining(value), {});
            expect(updateRemoving).not.toHaveBeenCalled();
        });

        it('calls onClose with changed value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => {
                return <button onClick={() => onClose({ '': 3, d: 2, m: -1, x: 0 })}>ValueBox</button>;
            });
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(onChange).toHaveBeenCalledWith({ '': 3, d: 2 }, false);
        });

        it('calls onClose with unchanged value', async () => {
            (ValueBox as unknown as jest.Mock).mockImplementation(({ onClose }) => {
                return <button onClick={() => onClose(value.value)}>ValueBox</button>;
            });
            render(<ValueCell {...value} onChange={onChange} />, withReduxState());
            await userEvent.click(screen.getByRole('cell'));
            act(() => jest.advanceTimersByTime(100));
            await userEvent.click(screen.getByRole('button', { name: 'ValueBox' }));
            expect(screen.queryByRole('button', { name: 'ValueBox' })).not.toBeInTheDocument();
            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
