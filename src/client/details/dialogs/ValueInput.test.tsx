import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ValueChange } from '~/client/details/dialogs/ValueChange';
import { ValueInput } from '~/client/details/dialogs/ValueInput';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useAddDetails');
jest.mock('~/state/details/useDeleteDetails');
jest.mock('~/state/details/useRenameDetails');
jest.mock('~/client/details/dialogs/ValueChange', () => ({
    ValueChange: jest.fn().mockReturnValue(null),
}));

describe('ValueInput', () => {
    afterEach(() => jest.clearAllMocks());

    const onClose = jest.fn();
    const onChange = jest.fn();

    describe('calls onClose when Enter key is pressed', () => {
        it('on the input', async () => {
            render(
                <ValueInput group="G" variant="" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{Enter}');
            expect(onClose).toHaveBeenCalled();
        });

        it('on the increase button', async () => {
            render(
                <ValueInput group="G" variant="" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{Enter}');
            expect(onClose).toHaveBeenCalled();
        });

        it('on the decrease button', async () => {
            render(
                <ValueInput group="G" variant="" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{Enter}');
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('calls onChange when amount is increased', () => {
        it('pressing arrow up on the input element', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the increase button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Increase' }));
            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the increase button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the decrease button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('calls onChange when amount is decreased', () => {
        it('pressing arrow down on the input element', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the decrease button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Decrease' }));
            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow down on the decrease button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow down on the increase button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('calls onChange when input amount is changed', async () => {
        render(<ValueInput group="G" variant="p" onClose={onClose} onChange={onChange} />, withReduxState());
        await userEvent.type(screen.getByRole('textbox'), '5');
        expect(onChange).toHaveBeenCalledWith('p', 5);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onChange when input amount is not a number', async () => {
        render(<ValueInput group="G" variant="" onClose={onClose} onChange={onChange} />, withReduxState());
        await userEvent.type(screen.getByRole('textbox'), 'a');
        expect(onChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    describe('difference status', () => {
        it('renders with positive change', async () => {
            render(<ValueInput group="G" variant="" amount={2} change={1} />, withReduxState());
            expect(screen.getByRole('textbox')).toHaveValue('3');
            expect(ValueChange).toHaveBeenCalledWith({ change: 1 }, {});
        });

        it('renders with negative change', async () => {
            render(<ValueInput group="G" variant="" amount={2} change={-1} />, withReduxState());
            expect(screen.getByRole('textbox')).toHaveValue('1');
            expect(ValueChange).toHaveBeenCalledWith({ change: -1 }, {});
        });

        it('renders with zero change', async () => {
            render(<ValueInput group="G" variant="" amount={2} change={0} />, withReduxState());
            expect(screen.getByRole('textbox')).toHaveValue('2');
            expect(ValueChange).toHaveBeenCalledWith({ change: 0 }, {});
        });
    });
});
