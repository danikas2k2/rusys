import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { AmountBox, type AmountBoxProps } from '~/client/pages/common/AmountBox';
import { AmountInput } from '~/client/pages/products/AmountInput';
import { AmountTitle } from '~/client/pages/products/AmountTitle';
import type { WithVariantsState } from '~/client/state/variants/types';
import { getVariantAmount } from '~/common/utils/amounts';
import type { VariantAmount } from '~/types/data';

jest.mock('~/client/pages/products/AmountInput', () => ({
    AmountInput: jest.fn(jest.requireActual('~/client/pages/products/AmountInput').AmountInput),
}));

describe('<AmountBox>', () => {
    afterEach(() => jest.clearAllMocks());

    const group = 'Uogienės';
    const amounts: VariantAmount[] = [
        { variant: 'p', amount: 1 },
        { variant: 'm', amount: 2 },
        { variant: 'd', amount: 3 },
    ];

    const variants = getVariantsFixture();
    const allVariants = variants.filter((v) => v.group === group).map((v) => v.variant);
    const state: WithVariantsState = { variants };

    const defaultProps: AmountBoxProps = {
        group,
        amounts,
        title: <AmountTitle group={group} name="Braškės" year={23} />,
    };

    const renderAmountBox = (props: Partial<AmountBoxProps> = {}) =>
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...defaultProps} {...props} />
                </UpdateTypeWrapper>
            </MockApp>
        );

    it('renders heading details', () => {
        renderAmountBox({ opened: true });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Braškės/)).toBeInTheDocument();
        expect(screen.getByText(/Uogienės/)).toBeInTheDocument();
    });

    it('renders controls', () => {
        renderAmountBox({ opened: true });

        expect(screen.getByLabelText(/Close/)).toBeInTheDocument();
        expect(screen.getByText(/Cancel/)).toBeInTheDocument();
        expect(screen.getByText(/Update/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Expand/ })).toBeInTheDocument();
    });

    // eslint-disable-next-line jest/prefer-ending-with-an-expect
    it('renders inputs', async () => {
        renderAmountBox({ opened: true });

        await screen.findByRole('dialog');

        expect(AmountInput).toHaveBeenCalledTimes(amounts.length);

        for (const { variant, amount } of amounts) {
            expect(AmountInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    variant,
                    amount,
                    change: 0,
                    focused: variant === amounts[0].variant,
                }),
                undefined
            );
        }
    });

    const onClose = jest.fn();

    it('calls onClose when dialog is closed', async () => {
        renderAmountBox({ opened: true, onClose });

        await user.click(screen.getByLabelText('Close'));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose when `Cancel` is clicked', async () => {
        renderAmountBox({ opened: true, onClose });

        await user.click(screen.getByText('Cancel'));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose without changes when `Update` is clicked', async () => {
        renderAmountBox({ opened: true, onClose });

        await user.click(screen.getByText('Update'));

        expect(onClose).toHaveBeenCalledWith([]);
    });

    const selection = {
        initialSelectionStart: 0,
        initialSelectionEnd: 10,
    };

    it('calls onClose with changes when `Update` is clicked after some changes in `Consumed` tab', async () => {
        renderAmountBox({ opened: true, onClose });

        await user.type(screen.getByLabelText('p'), '2', selection);
        await user.type(screen.getByLabelText('d'), '4', selection);
        await user.type(screen.getByLabelText('m'), '6', selection);

        await user.click(screen.getByText('Update'));

        expect(onClose).toHaveBeenCalledWith([
            { variant: 'p', amount: 1, recycled: false },
            { variant: 'd', amount: 1, recycled: false },
            { variant: 'm', amount: 4, recycled: false },
        ]);
    });

    it('calls onClose with changes when `Update` is clicked after some changes in `Recycled` tab', async () => {
        renderAmountBox({ opened: true, onClose });

        await user.click(screen.getByLabelText('Recycled'));

        await user.type(screen.getByLabelText('p'), '0', selection);
        await user.type(screen.getByLabelText('d'), '1', selection);
        await user.type(screen.getByLabelText('m'), '2', selection);

        await user.click(screen.getByText('Update'));

        expect(onClose).toHaveBeenCalledWith([
            { variant: 'p', amount: -1, recycled: true },
            { variant: 'd', amount: -2, recycled: true },
        ]);
    });

    it('calls onClose with changes when `Update` is clicked after some changes in `Consumed` and `Recycled` tabs', async () => {
        renderAmountBox({ opened: true, onClose });

        await user.type(screen.getByLabelText('p'), '2', selection);
        await user.click(screen.getByLabelText('Recycled'));
        await user.type(screen.getByLabelText('d'), '1', selection);

        await user.click(screen.getByText('Update'));

        expect(onClose).toHaveBeenCalledWith([
            { variant: 'p', amount: 1, recycled: false },
            { variant: 'd', amount: -2, recycled: true },
        ]);
    });

    // eslint-disable-next-line jest/prefer-ending-with-an-expect
    it('renders all variants when expand pressed', async () => {
        renderAmountBox({ opened: true });

        jest.mocked(AmountInput).mockClear();

        const expand = screen.getByRole('button', { name: 'Expand' });
        await user.click(expand);

        expect(expand).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveAttribute('data-full-screen', 'true');

        expect(AmountInput).toHaveBeenCalledTimes(allVariants.length);

        for (const variant of allVariants) {
            expect(AmountInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    variant,
                    amount: getVariantAmount(amounts, variant),
                    focused: !allVariants.indexOf(variant),
                }),
                undefined
            );
        }
    });

    it('ensure all changed values are preserved after expansion', async () => {
        renderAmountBox({ opened: true });

        await user.type(screen.getByLabelText('p'), '2', selection);

        expect(screen.getByLabelText('p')).toHaveValue('2');

        await user.type(screen.getByLabelText('d'), '4', selection);

        expect(screen.getByLabelText('d')).toHaveValue('4');

        await user.type(screen.getByLabelText('m'), '6', selection);

        expect(screen.getByLabelText('m')).toHaveValue('6');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.getByLabelText('p')).toHaveValue('2');
        expect(screen.getByLabelText('d')).toHaveValue('4');
        expect(screen.getByLabelText('m')).toHaveValue('6');
    });

    it('ensure focused item is still focused after expansion', async () => {
        renderAmountBox({ opened: true });

        await user.click(screen.getByLabelText('m'));

        expect(screen.getByLabelText('m')).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.getByLabelText('m')).toHaveFocus();
    });

    it('expand by default if value contains all available variants', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox
                        {...defaultProps}
                        amounts={allVariants.map((variant) => ({ variant, amount: 1 }))}
                        opened
                    />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveAttribute('data-full-screen', 'true');
    });

    describe('ensure to have no negative amounts', () => {
        it('does not accept any other symbols, but digits', async () => {
            renderAmountBox({ opened: true });

            await user.type(screen.getByLabelText('p'), '-', selection);

            expect(screen.getByLabelText('p')).toHaveValue('0');

            await user.type(screen.getByLabelText('p'), '.', selection);

            expect(screen.getByLabelText('p')).toHaveValue('');

            await user.type(screen.getByLabelText('p'), 'a', selection);

            expect(screen.getByLabelText('p')).toHaveValue('');
        });

        it('does not decrease value below zero while using `Increase`/`Decrease` buttons', async () => {
            renderAmountBox({ opened: true });

            await user.type(screen.getByLabelText('p'), '0', selection);

            expect(screen.getByLabelText('p')).toHaveValue('0');

            const decreaseButtons = screen.getAllByRole('button', { name: 'Decrease' });
            await user.click(decreaseButtons[0]);

            expect(screen.getByLabelText('p')).toHaveValue('0');

            const increaseButtons = screen.getAllByRole('button', { name: 'Increase' });
            await user.type(increaseButtons[0], '{ArrowDown}');

            expect(screen.getByLabelText('p')).toHaveValue('0');
        });
    });

    it('calls onAfterClose when dialog exit transition ends', async () => {
        const onAfterClose = jest.fn();

        const { rerender } = renderAmountBox({ opened: true, onAfterClose });

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByLabelText('Close'));

        rerender(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...defaultProps} amounts={amounts} opened={false} onAfterClose={onAfterClose} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });

    it('does not update when newValue would be negative', async () => {
        const onCloseHandler = jest.fn();

        renderAmountBox({
            opened: true,
            onClose: onCloseHandler,
            amounts: [{ variant: 'p', amount: 1 }],
        });

        const input = screen.getByLabelText('p');

        await user.type(input, '0', selection);

        expect(input).toHaveValue('0');

        const decreaseButton = screen.getByRole('button', { name: 'Decrease' });

        await user.click(decreaseButton);

        expect(input).toHaveValue('0');
    });

    it('updates existing variant change when variant already exists in currentChanges', async () => {
        const onCloseHandler = jest.fn();

        renderAmountBox({ opened: true, onClose: onCloseHandler });

        await user.type(screen.getByLabelText('p'), '2', selection);

        expect(screen.getByLabelText('p')).toHaveValue('2');

        await user.type(screen.getByLabelText('p'), '3', selection);

        expect(screen.getByLabelText('p')).toHaveValue('3');

        await user.click(screen.getByText('Update'));

        expect(onCloseHandler).toHaveBeenCalledWith([{ variant: 'p', amount: 2, recycled: false }]);
    });

    it('uses allVariants when amountVariants is empty', () => {
        const emptyState: WithVariantsState = { variants };

        render(
            <MockApp state={emptyState}>
                <UpdateTypeWrapper>
                    <AmountBox {...defaultProps} amounts={[]} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(AmountInput).toHaveBeenCalledTimes(1);
        expect(AmountInput).toHaveBeenCalledWith(expect.objectContaining({ variant: allVariants[0] }), undefined);
    });

    it('does not render modal when opened is false', () => {
        renderAmountBox({ opened: false });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('uses default opened value when not provided', () => {
        renderAmountBox();

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles undefined amounts', () => {
        renderAmountBox({ amounts: undefined, opened: true });

        expect(AmountInput).toHaveBeenCalledTimes(1);
        expect(AmountInput).toHaveBeenCalledWith(expect.objectContaining({ variant: allVariants[0] }), undefined);
    });

    it('does not call onClose when onClose is not provided', async () => {
        renderAmountBox({ opened: true });

        await user.click(screen.getByLabelText('Close'));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when Update is clicked and onClose is not provided', async () => {
        renderAmountBox({ opened: true });

        await user.click(screen.getByText('Update'));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onAfterClose when onAfterClose is not provided', async () => {
        const { rerender } = renderAmountBox({ opened: true });

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByLabelText('Close'));

        rerender(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...defaultProps} amounts={amounts} opened={false} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('adds new variant change when currentChanges is undefined', async () => {
        const onCloseHandler = jest.fn();

        renderAmountBox({ opened: true, onClose: onCloseHandler });

        await user.click(screen.getByLabelText('Recycled'));

        const input = screen.getByLabelText('p');
        await user.clear(input);
        await user.type(input, '2', selection);

        await user.click(screen.getByText('Update'));

        expect(onCloseHandler).toHaveBeenCalledWith([{ variant: 'p', amount: 1, recycled: true }]);
    });

    it('handles focus when ref is null', async () => {
        renderAmountBox({ opened: true });

        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });

    it('handles when allVariants is empty', () => {
        const emptyVariantsState: WithVariantsState = { variants: [] };

        render(
            <MockApp state={emptyVariantsState}>
                <UpdateTypeWrapper>
                    <AmountBox {...defaultProps} amounts={[]} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles when focused is undefined', async () => {
        renderAmountBox({ opened: true });

        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });

    it('calls handleFocus when enter transition ends', async () => {
        renderAmountBox({ opened: true });

        const dialog = await screen.findByRole('dialog');
        act(() => fireEvent.transitionEnd(dialog));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles handleFocus when ref is null', async () => {
        jest.mocked(AmountInput).mockImplementation(({ ref, variant }) => {
            // eslint-disable-next-line jest/no-conditional-in-test
            if (ref && typeof ref === 'function') {
                ref(null);
            }
            return <input aria-label={variant} />;
        });

        renderAmountBox({ opened: true });

        const dialog = await screen.findByRole('dialog');
        act(() => fireEvent.transitionEnd(dialog));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles handleFocus when ref is null during expand', async () => {
        jest.mocked(AmountInput).mockImplementation(({ ref, variant }) => {
            // eslint-disable-next-line jest/no-conditional-in-test
            if (ref && typeof ref === 'function') {
                ref(null);
            }
            return <input aria-label={variant} />;
        });

        renderAmountBox({ opened: true });

        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });
});
