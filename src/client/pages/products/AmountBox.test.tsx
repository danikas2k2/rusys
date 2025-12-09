import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { AmountBox, type AmountBoxProps } from '~/client/pages/products/AmountBox';
import { AmountInput } from '~/client/pages/products/AmountInput';
import type { WithVariantsState } from '~/client/state/variants/types';
import { getVariantAmount } from '~/common/utils/amounts';
import type { VariantAmount } from '~/types/data';

jest.mock('~/client/pages/products/AmountInput', () => ({
    AmountInput: jest.fn(jest.requireActual('~/client/pages/products/AmountInput').AmountInput),
}));

describe('<AmountBox>', () => {
    afterEach(() => jest.clearAllMocks());

    const group = 'Uogienės';
    const props: AmountBoxProps = {
        group,
        name: 'Braškės',
        year: 23,
    };

    const amounts: VariantAmount[] = [
        { variant: 'p', amount: 1 },
        { variant: 'm', amount: 2 },
        { variant: 'd', amount: 3 },
    ];

    const variants = getVariantsFixture();
    const allVariants = variants.filter((v) => v.group === group).map((v) => v.variant);
    const state: WithVariantsState = { variants };

    it('renders heading details', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Braškės/)).toBeInTheDocument();
        expect(screen.getByText(/Uogienės/)).toBeInTheDocument();
    });

    it('renders controls', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByLabelText(/Close/)).toBeInTheDocument();
        expect(screen.getByText(/Cancel/)).toBeInTheDocument();
        expect(screen.getByText(/Update/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Expand/ })).toBeInTheDocument();
    });

    // eslint-disable-next-line jest/prefer-ending-with-an-expect
    it('renders inputs', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await screen.findByRole('dialog');

        expect(AmountInput).toHaveBeenCalledTimes(amounts.length);

        for (const { variant, amount } of amounts) {
            expect(AmountInput).toHaveBeenCalledWith(
                expect.objectContaining({ variant, amount, focused: variant === amounts[0].variant }),
                undefined
            );
        }
    });

    const onClose = jest.fn();

    it('calls onClose when dialog is closed', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onClose} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByLabelText('Close'));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose when `Cancel` is clicked', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onClose} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByText('Cancel'));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose without changes when `Update` is clicked', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onClose} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByText('Update'));

        expect(onClose).toHaveBeenCalledWith([]);
    });

    const selection = {
        initialSelectionStart: 0,
        initialSelectionEnd: 10,
    };

    it('calls onClose with changes when `Update` is clicked after some changes in `Consumed` tab', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onClose} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onClose} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onClose} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        jest.mocked(AmountInput).mockClear();

        // expect(screen.getByRole('dialog')).not.toHaveClass('fullscreen');

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
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByLabelText('m'));

        expect(screen.getByLabelText('m')).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.getByLabelText('m')).toHaveFocus();
    });

    it('expand by default if value contains all available variants', async () => {
        render(
            <MockApp state={state}>
                <AmountBox {...props} amounts={allVariants.map((variant) => ({ variant, amount: 1 }))} opened />
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveAttribute('data-full-screen', 'true');
    });

    describe('ensure to have no negative amounts', () => {
        it('does not accept any other symbols, but digits', async () => {
            render(
                <MockApp state={state}>
                    <UpdateTypeWrapper>
                        <AmountBox {...props} amounts={amounts} opened />
                    </UpdateTypeWrapper>
                </MockApp>
            );

            await user.type(screen.getByLabelText('p'), '-', selection);

            expect(screen.getByLabelText('p')).toHaveValue('0');

            await user.type(screen.getByLabelText('p'), '.', selection);

            expect(screen.getByLabelText('p')).toHaveValue('');

            await user.type(screen.getByLabelText('p'), 'a', selection);

            expect(screen.getByLabelText('p')).toHaveValue('');
        });

        it('does not decrease value below zero while using `Increase`/`Decrease` buttons', async () => {
            render(
                <MockApp state={state}>
                    <UpdateTypeWrapper>
                        <AmountBox {...props} amounts={amounts} opened />
                    </UpdateTypeWrapper>
                </MockApp>
            );

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

        const { rerender } = render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened onAfterClose={onAfterClose} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByLabelText('Close'));

        rerender(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened={false} onAfterClose={onAfterClose} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });

    it('renders without year when year is 0', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} year={0} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByText(/Uogienės/)).toBeInTheDocument();
        expect(screen.queryByText(/, 0/)).not.toBeInTheDocument();
    });

    it('does not update when newValue would be negative', async () => {
        const onCloseHandler = jest.fn();

        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onCloseHandler} amounts={[{ variant: 'p', amount: 1 }]} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        const input = screen.getByLabelText('p');

        await user.type(input, '0', selection);

        expect(input).toHaveValue('0');

        const decreaseButton = screen.getByRole('button', { name: 'Decrease' });

        await user.click(decreaseButton);

        expect(input).toHaveValue('0');
    });

    it('updates existing variant change when variant already exists in currentChanges', async () => {
        const onCloseHandler = jest.fn();

        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onCloseHandler} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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
                    <AmountBox {...props} amounts={[]} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(AmountInput).toHaveBeenCalledTimes(1);
        expect(AmountInput).toHaveBeenCalledWith(expect.objectContaining({ variant: allVariants[0] }), undefined);
    });

    it('does not render modal when opened is false', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened={false} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('uses default opened value when not provided', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles undefined amounts', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={undefined} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(AmountInput).toHaveBeenCalledTimes(1);
        expect(AmountInput).toHaveBeenCalledWith(expect.objectContaining({ variant: allVariants[0] }), undefined);
    });

    it('does not call onClose when onClose is not provided', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByLabelText('Close'));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when Update is clicked and onClose is not provided', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByText('Update'));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onAfterClose when onAfterClose is not provided', async () => {
        const { rerender } = render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByLabelText('Close'));

        rerender(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened={false} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('adds new variant change when currentChanges is undefined', async () => {
        const onCloseHandler = jest.fn();

        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} onClose={onCloseHandler} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await user.click(screen.getByLabelText('Recycled'));

        const input = screen.getByLabelText('p');
        await user.clear(input);
        await user.type(input, '2', selection);

        await user.click(screen.getByText('Update'));

        expect(onCloseHandler).toHaveBeenCalledWith([{ variant: 'p', amount: 1, recycled: true }]);
    });

    it('handles focus when ref is null', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });

    it('renders year when year is provided', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} year={2024} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByText(/Uogienės, 2024/)).toBeInTheDocument();
    });

    it('handles when allVariants is empty', () => {
        const emptyVariantsState: WithVariantsState = { variants: [] };

        render(
            <MockApp state={emptyVariantsState}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={[]} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles when focused is undefined', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });

    it('calls handleFocus when enter transition ends', async () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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

        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

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

        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <AmountBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Expand' }));

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
    });
});
