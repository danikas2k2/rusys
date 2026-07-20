import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ChangeBadge } from '~/client/common/ChangeBadge';
import { AmountInput } from '~/client/pages/products/AmountInput';

vi.mock(import('~/client/state/products/useAddProduct'));
vi.mock(import('~/client/state/products/useDeleteProduct'));
vi.mock(import('~/client/state/products/useRenameProduct'));
vi.mock(import('~/client/common/ChangeBadge'), () => ({
    ChangeBadge: vi.fn().mockReturnValue(null),
}));

describe('<AmountInput>', () => {
    afterEach(() => vi.clearAllMocks());

    const onClose = vi.fn();
    const onChange = vi.fn();

    describe('calls onClose when Enter key is pressed', () => {
        it('on the input', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox'), '{Enter}');

            expect(onClose).toHaveBeenCalledWith('');
        });

        it('on the increase button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('button', { name: 'Increase' }), '{Enter}');

            expect(onClose).toHaveBeenCalledWith('');
        });

        it('on the decrease button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('button', { name: 'Decrease' }), '{Enter}');

            expect(onClose).toHaveBeenCalledWith('');
        });
    });

    describe('calls onChange when amount is increased', () => {
        it('pressing arrow up on the input element', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox'), '{ArrowUp}');

            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the increase button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Increase' }));

            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the increase button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('button', { name: 'Increase' }), '{ArrowUp}');

            expect(onChange).toHaveBeenCalledWith('p', 1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow up on the decrease button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('button', { name: 'Decrease' }), '{ArrowUp}');

            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('calls onChange when amount is decreased', () => {
        it('pressing arrow down on the input element', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox'), '{ArrowDown}');

            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('clicking the decrease button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Decrease' }));

            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow down on the decrease button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('button', { name: 'Decrease' }), '{ArrowDown}');

            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });

        it('pressing arrow down on the increase button', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onClose={onClose} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('button', { name: 'Increase' }), '{ArrowDown}');

            expect(onChange).toHaveBeenCalledWith('p', -1);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('calls onChange when input amount is changed', async () => {
        render(
            <MockTheme>
                <AmountInput variant="p" onClose={onClose} onChange={onChange} />
            </MockTheme>
        );

        await user.type(screen.getByRole('textbox'), '5');

        expect(onChange).toHaveBeenCalledWith('p', 5);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onChange when input amount is not a number', async () => {
        render(
            <MockTheme>
                <AmountInput variant="" onClose={onClose} onChange={onChange} />
            </MockTheme>
        );

        await user.type(screen.getByRole('textbox'), 'a');

        expect(onChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    describe('difference status', () => {
        it('renders with positive change', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="" amount={2} change={1} />
                </MockTheme>
            );

            expect(screen.getByRole('textbox')).toHaveValue('3');
            expect(ChangeBadge).toHaveBeenCalledWith({ change: 1 }, undefined);
        });

        it('renders with negative change', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="" amount={2} change={-1} />
                </MockTheme>
            );

            expect(screen.getByRole('textbox')).toHaveValue('1');
            expect(ChangeBadge).toHaveBeenCalledWith({ change: -1 }, undefined);
        });

        it('renders with zero change', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="" amount={2} change={0} />
                </MockTheme>
            );

            expect(screen.getByRole('textbox')).toHaveValue('2');
            expect(ChangeBadge).toHaveBeenCalledWith({ change: 0 }, undefined);
        });
    });

    describe('focus and blur handlers', () => {
        it('calls onFocus when input is focused', async () => {
            const onFocus = vi.fn();

            render(
                <MockTheme>
                    <AmountInput variant="p" onFocus={onFocus} />
                </MockTheme>
            );

            await user.click(screen.getByRole('textbox'));

            expect(onFocus).toHaveBeenCalledWith('p');
        });

        it('calls onBlur when input loses focus', async () => {
            const onBlur = vi.fn();

            render(
                <MockTheme>
                    <AmountInput variant="p" onBlur={onBlur} />
                </MockTheme>
            );

            await user.click(screen.getByRole('textbox'));
            await user.tab();

            expect(onBlur).toHaveBeenCalledWith('p');
        });
    });

    describe('handleChange edge cases', () => {
        it('handles empty string value', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onChange={onChange} />
                </MockTheme>
            );

            await user.clear(screen.getByRole('textbox'));

            expect(onChange).toHaveBeenCalledWith('p', -2);
        });

        it('handles number value directly', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox'), '5', {
                initialSelectionStart: 0,
                initialSelectionEnd: 1,
            });

            expect(onChange).toHaveBeenCalledWith('p', 3);
        });

        it('handles invalid string value by converting to 0', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox'), 'invalid', {
                initialSelectionStart: 0,
                initialSelectionEnd: 1,
            });

            expect(onChange).toHaveBeenCalledWith('p', -2);
        });
    });

    describe('optional callbacks', () => {
        it('does not call onChange when onChange is not provided', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Increase' }));

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not call onClose when onClose is not provided', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox'), '{Enter}');

            expect(onClose).not.toHaveBeenCalled();
        });

        it('does not call onFocus when onFocus is not provided', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} />
                </MockTheme>
            );

            await user.click(screen.getByRole('textbox'));

            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('does not call onBlur when onBlur is not provided', async () => {
            render(
                <MockTheme>
                    <AmountInput variant="p" amount={2} />
                </MockTheme>
            );

            const input = screen.getByRole('textbox');

            await user.click(input);
            await user.tab();

            expect(input).not.toHaveFocus();
        });
    });
});
