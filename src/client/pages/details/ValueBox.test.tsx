import { render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { ValueBox, type ValueBoxProps } from '~/client/pages/details/ValueBox';
import { ValueInput } from '~/client/pages/details/ValueInput';
import type { WithVariantsState } from '~/client/state/variants/types';
import { getVariantAmount } from '~/common/utils/amounts';
import type { VariantAmount } from '~/types/data';

jest.mock('~/client/pages/details/ValueInput', () => ({
    ValueInput: jest.fn(jest.requireActual('~/client/pages/details/ValueInput').ValueInput),
}));

describe('<ValueBox>', () => {
    afterEach(() => jest.clearAllMocks());

    const group = 'Uogienės';
    const props: ValueBoxProps = {
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
                    <ValueBox {...props} amounts={amounts} opened />
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
                    <ValueBox {...props} amounts={amounts} opened />
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
                    <ValueBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await screen.findByRole('dialog');

        expect(ValueInput).toHaveBeenCalledTimes(amounts.length);

        for (const { variant, amount } of amounts) {
            expect(ValueInput).toHaveBeenCalledWith(
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
                    <ValueBox {...props} onClose={onClose} amounts={amounts} opened />
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
                    <ValueBox {...props} onClose={onClose} amounts={amounts} opened />
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
                    <ValueBox {...props} onClose={onClose} amounts={amounts} opened />
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
                    <ValueBox {...props} onClose={onClose} amounts={amounts} opened />
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
                    <ValueBox {...props} onClose={onClose} amounts={amounts} opened />
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
                    <ValueBox {...props} onClose={onClose} amounts={amounts} opened />
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
                    <ValueBox {...props} amounts={amounts} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        jest.mocked(ValueInput).mockClear();

        // expect(screen.getByRole('dialog')).not.toHaveClass('fullscreen');

        const expand = screen.getByRole('button', { name: 'Expand' });
        await user.click(expand);

        expect(expand).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveAttribute('data-full-screen', 'true');

        expect(ValueInput).toHaveBeenCalledTimes(allVariants.length);

        for (const variant of allVariants) {
            expect(ValueInput).toHaveBeenCalledWith(
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
                    <ValueBox {...props} amounts={amounts} opened />
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
                    <ValueBox {...props} amounts={amounts} opened />
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
                <ValueBox {...props} amounts={allVariants.map((variant) => ({ variant, amount: 1 }))} opened />
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
                        <ValueBox {...props} amounts={amounts} opened />
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
                        <ValueBox {...props} amounts={amounts} opened />
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
                    <ValueBox {...props} amounts={amounts} opened onAfterClose={onAfterClose} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await screen.findByRole('dialog');

        await user.click(screen.getByLabelText('Close'));

        rerender(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <ValueBox {...props} amounts={amounts} opened={false} onAfterClose={onAfterClose} />
                </UpdateTypeWrapper>
            </MockApp>
        );

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });

    it('renders without year when year is 0', () => {
        render(
            <MockApp state={state}>
                <UpdateTypeWrapper>
                    <ValueBox {...props} year={0} amounts={amounts} opened />
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
                    <ValueBox {...props} onClose={onCloseHandler} amounts={[{ variant: 'p', amount: 1 }]} opened />
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
                    <ValueBox {...props} onClose={onCloseHandler} amounts={amounts} opened />
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
                    <ValueBox {...props} amounts={[]} opened />
                </UpdateTypeWrapper>
            </MockApp>
        );

        expect(ValueInput).toHaveBeenCalledTimes(1);
        expect(ValueInput).toHaveBeenCalledWith(expect.objectContaining({ variant: allVariants[0] }), undefined);
    });
});
