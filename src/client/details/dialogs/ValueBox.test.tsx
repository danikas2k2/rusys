import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ValueBox, type ValueBoxProps } from '~/client/details/dialogs/ValueBox';
import { ValueInput } from '~/client/details/dialogs/ValueInput';
import { type VariantAmount } from '~/common/types';
import { type WithVariantsState } from '~/state/variants/types';
import { getTestVariants } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

const mockValueInput = jest.spyOn<any, string>(ValueInput, 'render');

describe('ValueBox', () => {
    beforeEach(() => jest.clearAllMocks());

    const props: ValueBoxProps = {
        group: 'G',
        name: 'A',
        year: 21,
    };
    const amounts: VariantAmount[] = [
        { variant: 'p', amount: 1 },
        { variant: 'm', amount: 2 },
        { variant: 'd', amount: 3 },
    ];

    const variants = getTestVariants();
    const allVariants = variants.filter((v) => v.group === props.group).map((v) => v.variant);

    const state: WithVariantsState = { variants };

    it('renders on the document', () => {
        render(<ValueBox group="Uogienės" name="Braškės" year={23} amounts={amounts} />, withReduxState(state));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
        expect(screen.getByText('Braškės')).toBeInTheDocument();
        expect(screen.getByText('23')).toBeInTheDocument();

        expect(mockValueInput).toHaveBeenCalledTimes(amounts.length);
        for (const { variant, amount: initialAmount } of amounts) {
            expect(mockValueInput).toHaveBeenCalledWith(
                expect.objectContaining({ variant, initialAmount, focus: !variant }),
                expect.objectContaining({ current: null })
            );
        }
    });

    it('calls onClose when dialog is closed', async () => {
        const onClose = jest.fn();
        render(<ValueBox {...props} onClose={onClose} amounts={amounts} />, withReduxState(state));
        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith(amounts, false);
    });

    it('calls onClose when dialog is closed after `Items removed` clicked', async () => {
        const onClose = jest.fn();
        render(<ValueBox {...props} onClose={onClose} amounts={amounts} />, withReduxState(state));

        const removed = screen.getByRole('radio', { name: 'Items removed' });
        expect(removed).not.toBeChecked();

        await userEvent.click(removed);
        expect(removed).toBeChecked();

        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith(amounts, true);
    });

    it('calls onClose when dialog is closed after `Items used` clicked', async () => {
        const onClose = jest.fn();
        render(<ValueBox {...props} onClose={onClose} amounts={amounts} />, withReduxState(state));

        const used = screen.getByRole('radio', { name: 'Items used' });
        expect(used).toBeChecked();

        await userEvent.click(screen.getByRole('radio', { name: 'Items removed' }));
        expect(used).not.toBeChecked();

        await userEvent.click(used);
        expect(used).toBeChecked();

        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith(amounts, false);
    });

    it('renders all variants when expand pressed', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withReduxState(state));

        expect(screen.getByRole('dialog')).not.toHaveClass('fullScreen');
        mockValueInput.mockClear();

        await userEvent.click(screen.getByLabelText('Expand'));
        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveClass('fullScreen');

        expect(mockValueInput).toHaveBeenCalledTimes(allVariants.length);
        for (const variant of allVariants) {
            expect(mockValueInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    variant,
                    initialAmount: amounts.find((v) => v.variant === variant)?.amount,
                    focus: !allVariants.indexOf(variant),
                }),
                expect.objectContaining({ current: expect.any(Object) })
            );
        }
    });

    it('ensure all changed values are preserved after expansion', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withReduxState(state));

        await userEvent.type(screen.getByLabelText(''), '2', {
            initialSelectionStart: 0,
            initialSelectionEnd: 10,
        });
        expect(screen.getByLabelText('')).toHaveValue('2');

        await userEvent.type(screen.getByLabelText('d'), '4', {
            initialSelectionStart: 0,
            initialSelectionEnd: 10,
        });
        expect(screen.getByLabelText('d')).toHaveValue('4');

        await userEvent.type(screen.getByLabelText('m'), '6', {
            initialSelectionStart: 0,
            initialSelectionEnd: 10,
        });
        expect(screen.getByLabelText('m')).toHaveValue('6');

        await userEvent.click(screen.getByLabelText('Expand'));

        expect(screen.getByLabelText('')).toHaveValue('2');
        expect(screen.getByLabelText('d')).toHaveValue('4');
        expect(screen.getByLabelText('m')).toHaveValue('6');
    });

    it('ensure focused item is still focused after expansion', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withReduxState(state));

        await userEvent.click(screen.getByLabelText('m'));
        expect(screen.getByLabelText('m')).toHaveFocus();

        await userEvent.click(screen.getByLabelText('Expand'));

        expect(screen.getByLabelText('m')).toHaveFocus();
    });

    it('expand by default if value contains all available variants', async () => {
        render(
            <ValueBox {...props} amounts={allVariants.map((variant) => ({ variant, amount: 1 }))} />,
            withReduxState(state)
        );

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveClass('fullScreen');
    });

    it('ensure negative values not to be stored', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withReduxState(state));

        await userEvent.type(screen.getByLabelText(''), '-2', {
            initialSelectionStart: 0,
            initialSelectionEnd: 10,
        });
        expect(screen.getByLabelText('')).toHaveValue('0');

        await userEvent.click(screen.getByRole('spinbutton', { name: 'Decrease', current: true }));
        expect(screen.getByLabelText('')).toHaveValue('0');

        await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase', current: true }), '{ArrowDown}');
        expect(screen.getByLabelText('')).toHaveValue('0');
    });
});
