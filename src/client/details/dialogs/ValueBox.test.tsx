import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ValueBox, type ValueBoxProps } from '~/client/details/dialogs/ValueBox';
import { ValueInput } from '~/client/details/dialogs/ValueInput';
import { getVariantAmount } from '~/client/details/utils/amounts';
import { type VariantAmount } from '~/common/types';
import { type WithVariantsState } from '~/state/variants/types';
import { getVariantsFixture } from '~/tests/fixtures';
import { withMany } from '~/tests/withMany';
import { withRecycledContext } from '~/tests/withRecycledContext';
import { withReduxState } from '~/tests/withReduxState';

const mockValueInput = jest.spyOn<any, string>(ValueInput, 'render');

describe('ValueBox', () => {
    beforeEach(() => jest.clearAllMocks());

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
        render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
        expect(screen.getByText('Braškės')).toBeInTheDocument();
        expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('renders controls', () => {
        render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));
        expect(screen.getByLabelText('Close')).toBeInTheDocument();
        expect(screen.getByText('Consumed')).toBeInTheDocument();
        expect(screen.getByText('Recycled')).toBeInTheDocument();
        expect(screen.getByLabelText('Expand')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('renders inputs', () => {
        render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));
        expect(mockValueInput).toHaveBeenCalledTimes(amounts.length);
        for (const { variant, amount } of amounts) {
            expect(mockValueInput).toHaveBeenCalledWith(
                expect.objectContaining({ variant, amount, focus: variant === amounts[0].variant }),
                expect.anything()
            );
        }
    });

    it('calls onClose when dialog is closed', async () => {
        const onClose = jest.fn();
        render(
            <ValueBox {...props} onClose={onClose} amounts={amounts} />,
            withMany(withReduxState(state), withRecycledContext())
        );
        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose when `Cancel` is clicked', async () => {
        const onClose = jest.fn();
        render(
            <ValueBox {...props} onClose={onClose} amounts={amounts} />,
            withMany(withReduxState(state), withRecycledContext())
        );
        await userEvent.click(screen.getByText('Cancel'));
        expect(onClose).toHaveBeenCalledWith();
    });

    it('calls onClose without changes when `Update` is clicked', async () => {
        const onClose = jest.fn();
        render(
            <ValueBox {...props} onClose={onClose} amounts={amounts} />,
            withMany(withReduxState(state), withRecycledContext())
        );
        await userEvent.click(screen.getByText('Update'));
        expect(onClose).toHaveBeenCalledWith([]);
    });

    const selection = {
        initialSelectionStart: 0,
        initialSelectionEnd: 10,
    };

    it('calls onClose with changes when `Update` is clicked after some changes in `Consumed` tab', async () => {
        const onClose = jest.fn();
        render(
            <ValueBox {...props} onClose={onClose} amounts={amounts} />,
            withMany(withReduxState(state), withRecycledContext())
        );

        await userEvent.type(screen.getByLabelText('p'), '2', selection);
        await userEvent.type(screen.getByLabelText('d'), '4', selection);
        await userEvent.type(screen.getByLabelText('m'), '6', selection);

        await userEvent.click(screen.getByText('Update'));
        expect(onClose).toHaveBeenCalledWith([
            { variant: 'p', amount: 1 },
            { variant: 'd', amount: 1 },
            { variant: 'm', amount: 4 },
        ]);
    });

    it('calls onClose with changes when `Update` is clicked after some changes in `Recycled` tab', async () => {
        const onClose = jest.fn();
        render(
            <ValueBox {...props} onClose={onClose} amounts={amounts} />,
            withMany(withReduxState(state), withRecycledContext())
        );
        await userEvent.click(screen.getByText('Recycled'));

        await userEvent.type(screen.getByLabelText('p'), '0', selection);
        await userEvent.type(screen.getByLabelText('d'), '1', selection);
        await userEvent.type(screen.getByLabelText('m'), '2', selection);

        await userEvent.click(screen.getByText('Update'));
        expect(onClose).toHaveBeenCalledWith([
            { variant: 'p', amount: -1, recycled: true },
            { variant: 'd', amount: -2, recycled: true },
        ]);
    });

    it('calls onClose with changes when `Update` is clicked after some changes in `Consumed` and `Recycled` tabs', async () => {
        const onClose = jest.fn();
        render(
            <ValueBox {...props} onClose={onClose} amounts={amounts} />,
            withMany(withReduxState(state), withRecycledContext())
        );

        await userEvent.type(screen.getByLabelText('p'), '2', selection);
        await userEvent.click(screen.getByText('Recycled'));
        await userEvent.type(screen.getByLabelText('d'), '1', selection);

        await userEvent.click(screen.getByText('Update'));
        expect(onClose).toHaveBeenCalledWith([
            { variant: 'p', amount: 1 },
            { variant: 'd', amount: -2, recycled: true },
        ]);
    });

    it('renders all variants when expand pressed', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));
        mockValueInput.mockClear();

        expect(screen.getByRole('dialog')).not.toHaveClass('fullscreen');
        const expand = screen.getByLabelText('Expand');
        await userEvent.click(expand);

        expect(expand).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveClass('fullscreen');

        expect(mockValueInput).toHaveBeenCalledTimes(allVariants.length);
        for (const variant of allVariants) {
            expect(mockValueInput).toHaveBeenCalledWith(
                expect.objectContaining({
                    variant,
                    amount: getVariantAmount(amounts, variant),
                    focus: !allVariants.indexOf(variant),
                }),
                expect.anything()
            );
        }
    });

    it('ensure all changed values are preserved after expansion', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));

        await userEvent.type(screen.getByLabelText('p'), '2', selection);
        expect(screen.getByLabelText('p')).toHaveValue('2');

        await userEvent.type(screen.getByLabelText('d'), '4', selection);
        expect(screen.getByLabelText('d')).toHaveValue('4');

        await userEvent.type(screen.getByLabelText('m'), '6', selection);
        expect(screen.getByLabelText('m')).toHaveValue('6');

        await userEvent.click(screen.getByLabelText('Expand'));

        expect(screen.getByLabelText('p')).toHaveValue('2');
        expect(screen.getByLabelText('d')).toHaveValue('4');
        expect(screen.getByLabelText('m')).toHaveValue('6');
    });

    it('ensure focused item is still focused after expansion', async () => {
        render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));

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

        expect(screen.queryByLabelText('Expand')).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveClass('fullscreen');
    });

    describe('ensure to have no negative amounts', () => {
        it('does not accept any other symbols, but digits', async () => {
            render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));

            await userEvent.type(screen.getByLabelText('p'), '-', selection);
            expect(screen.getByLabelText('p')).toHaveValue('1');

            await userEvent.type(screen.getByLabelText('p'), '.', selection);
            expect(screen.getByLabelText('p')).toHaveValue('1');

            await userEvent.type(screen.getByLabelText('p'), 'a', selection);
            expect(screen.getByLabelText('p')).toHaveValue('1');
        });

        it('does not decrease value below zero while using `Increase`/`Decrease` buttons', async () => {
            render(<ValueBox {...props} amounts={amounts} />, withMany(withReduxState(state), withRecycledContext()));

            await userEvent.type(screen.getByLabelText('p'), '0', selection);
            expect(screen.getByLabelText('p')).toHaveValue('0');

            await userEvent.click(screen.getByRole('spinbutton', { name: 'Decrease', current: true }));
            expect(screen.getByLabelText('p')).toHaveValue('0');

            await userEvent.type(screen.getByRole('spinbutton', { name: 'Increase', current: true }), '{ArrowDown}');
            expect(screen.getByLabelText('p')).toHaveValue('0');
        });
    });
});
