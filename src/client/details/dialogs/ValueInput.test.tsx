import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ValueInput } from '~/client/details/dialogs/ValueInput';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useAddDetails');
jest.mock('~/state/details/useDeleteDetails');
jest.mock('~/state/details/useRenameDetails');

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
            expect(onChange).toHaveBeenCalledWith('p', 3);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the increase button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Increase' }));
            expect(onChange).toHaveBeenCalledWith('p', 3);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the increase button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith('p', 3);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the decrease button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith('p', 3);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('calls onChange when amount is decreased', () => {
        it('pressing arrow up on the input element', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the decrease button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Decrease' }));
            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the decrease button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the increase button', async () => {
            render(
                <ValueInput group="G" variant="p" amount={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith('p', 1);
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
        it('display positive difference when previous amount is less than current amount', async () => {
            render(<ValueInput group="G" variant="" initialAmount={2} amount={3} />, withReduxState());
            expect(screen.getByRole('status')).toHaveTextContent('1');
            expect(screen.getByRole('status')).toHaveClass('positive');
        });

        it('display negative difference when previous amount is greater than current amount', async () => {
            render(<ValueInput group="G" variant="" initialAmount={3} amount={2} />, withReduxState());
            expect(screen.getByRole('status')).toHaveTextContent('1');
            expect(screen.getByRole('status')).not.toHaveClass('positive');
        });

        it('does not display difference when previous amount is equal to current amount', async () => {
            render(<ValueInput group="G" variant="" initialAmount={2} amount={2} />, withReduxState());
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });
});
