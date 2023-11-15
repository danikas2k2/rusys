import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ValueInput from '~/client/details/dialogs/ValueInput';
import { Variant } from '~/state/details/types';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/details/useAddDetails');
jest.mock('~/state/details/useRemoveDetails');
jest.mock('~/state/details/useRenameDetails');

describe('ValueInput', () => {
    afterEach(() => jest.clearAllMocks());

    const onClose = jest.fn();
    const onChange = jest.fn();

    describe('calls onClose when Enter key is pressed', () => {
        it('on the input', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{Enter}');
            expect(onClose).toHaveBeenCalled();
        });

        it('on the increase button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{Enter}');
            expect(onClose).toHaveBeenCalled();
        });

        it('on the decrease button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{Enter}');
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('calls onChange when value is increased', () => {
        it('pressing arrow up on the input element', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith(3);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the increase button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Increase' }));
            expect(onChange).toHaveBeenCalledWith(3);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the increase button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith(3);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the decrease button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{ArrowUp}');
            expect(onChange).toHaveBeenCalledWith(3);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('calls onChange when value is decreased', () => {
        it('pressing arrow up on the input element', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('textbox'), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith(1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the decrease button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.click(screen.getByRole('spinbutton', { name: 'Decrease' }));
            expect(onChange).toHaveBeenCalledWith(1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the decrease button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Decrease' }), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith(1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the increase button', async () => {
            render(
                <ValueInput variant={Variant.PUSLITRIS} value={2} onClose={onClose} onChange={onChange} />,
                withReduxState()
            );
            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase' }), '{ArrowDown}');
            expect(onChange).toHaveBeenCalledWith(1);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('calls onChange when input value is changed', async () => {
        render(<ValueInput variant={Variant.PUSLITRIS} onClose={onClose} onChange={onChange} />, withReduxState());
        await userEvent.type(screen.getByRole('textbox'), '5');
        expect(onChange).toHaveBeenCalledWith(5);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onChange when input value is not a number', async () => {
        render(<ValueInput variant={Variant.PUSLITRIS} onClose={onClose} onChange={onChange} />, withReduxState());
        await userEvent.type(screen.getByRole('textbox'), 'a');
        expect(onChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    describe('difference status', () => {
        it('display positive difference when previous value is less than current value', async () => {
            render(<ValueInput variant={Variant.PUSLITRIS} prevValue={2} value={3} />, withReduxState());
            expect(screen.getByRole('status')).toHaveTextContent('1');
            expect(screen.getByRole('status')).toHaveClass('positive');
        });

        it('display negative difference when previous value is greater than current value', async () => {
            render(<ValueInput variant={Variant.PUSLITRIS} prevValue={3} value={2} />, withReduxState());
            expect(screen.getByRole('status')).toHaveTextContent('1');
            expect(screen.getByRole('status')).not.toHaveClass('positive');
        });

        it('does not display difference when previous value is equal to current value', async () => {
            render(<ValueInput variant={Variant.PUSLITRIS} prevValue={2} value={2} />, withReduxState());
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });
});
