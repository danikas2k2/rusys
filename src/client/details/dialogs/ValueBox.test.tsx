import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ValueBox from '~/client/details/dialogs/ValueBox';
import ValueInput from '~/client/details/dialogs/ValueInput';
import { type Amount, Variant } from '~/state/details/types';
import { withReduxState } from '~/tests/withReduxState';

// const mockValueInput = jest.fn();
const mockValueInput = jest.spyOn<any, string>(ValueInput.type, 'render'); /*.mockImplementation(mockValueInput)*/

describe('ValueBox', () => {
    beforeEach(() => jest.clearAllMocks());

    const value: Amount = {
        [Variant.PUSLITRIS]: 1,
        [Variant.MAZESNIS]: 2,
        [Variant.DIDESNIS]: 3,
    };

    it('renders on the document', () => {
        render(<ValueBox group="Uogienės" name="Braškės" year={23} value={value} />, withReduxState());

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Uogienės')).toBeInTheDocument();
        expect(screen.getByText('Braškės')).toBeInTheDocument();
        expect(screen.getByText('23')).toBeInTheDocument();

        const values = Object.entries(value);
        expect(mockValueInput).toHaveBeenCalledTimes(values.length);
        for (const [variant, prevValue] of values) {
            expect(mockValueInput).toHaveBeenCalledWith(
                expect.objectContaining({ variant, prevValue, focus: !variant }),
                expect.objectContaining({ current: null })
            );
        }
    });

    it('calls onClose when dialog is closed', async () => {
        const onClose = jest.fn();
        render(<ValueBox onClose={onClose} value={value} />, withReduxState());
        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith(value, false);
    });

    it('calls onClose when dialog is closed after `Items removed` clicked', async () => {
        const onClose = jest.fn();
        render(<ValueBox onClose={onClose} value={value} />, withReduxState());

        const removed = screen.getByRole('radio', { name: 'Items removed' });
        expect(removed).not.toBeChecked();

        await userEvent.click(removed);
        expect(removed).toBeChecked();

        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith(value, true);
    });

    it('calls onClose when dialog is closed after `Items used` clicked', async () => {
        const onClose = jest.fn();
        render(<ValueBox onClose={onClose} value={value} />, withReduxState());

        const used = screen.getByRole('radio', { name: 'Items used' });
        expect(used).toBeChecked();

        await userEvent.click(screen.getByRole('radio', { name: 'Items removed' }));
        expect(used).not.toBeChecked();

        await userEvent.click(used);
        expect(used).toBeChecked();

        await userEvent.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledWith(value, false);
    });

    const allVariants = [
        Variant.PUSLITRIS,
        Variant.DIDESNIS,
        Variant.MAZESNIS,
        Variant.EGLYTES,
        Variant.LITRAS,
        Variant.PUSANTRO,
        Variant.DVILITRIS,
        Variant.TRILITRIS,
        Variant.BLOGAS,
    ];

    it('renders all variants when expand pressed', async () => {
        render(<ValueBox value={value} />, withReduxState());

        expect(screen.getByRole('dialog')).not.toHaveClass('fullScreen');
        mockValueInput.mockClear();

        await userEvent.click(screen.getByLabelText('Expand'));
        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveClass('fullScreen');

        expect(mockValueInput).toHaveBeenCalledTimes(allVariants.length);
        for (const variant of allVariants) {
            expect(mockValueInput).toHaveBeenCalledWith(
                expect.objectContaining({ variant, prevValue: value[variant], focus: !variant }),
                expect.objectContaining({ current: expect.any(Object) })
            );
        }
    });

    it('ensure all changed values are preserved after expansion', async () => {
        render(<ValueBox value={value} />, withReduxState());

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
        render(<ValueBox value={value} />, withReduxState());

        await userEvent.click(screen.getByLabelText('m'));
        expect(screen.getByLabelText('m')).toHaveFocus();

        await userEvent.click(screen.getByLabelText('Expand'));

        expect(screen.getByLabelText('m')).toHaveFocus();
    });

    it('expand by default if value contains all available variants', async () => {
        render(
            <ValueBox
                value={{
                    [Variant.PUSLITRIS]: 1,
                    [Variant.MAZESNIS]: 2,
                    [Variant.DIDESNIS]: 3,
                    [Variant.EGLYTES]: 4,
                    [Variant.LITRAS]: 5,
                    [Variant.PUSANTRO]: 6,
                    [Variant.DVILITRIS]: 7,
                    [Variant.TRILITRIS]: 8,
                    [Variant.BLOGAS]: 9,
                }}
            />,
            withReduxState()
        );

        expect(screen.queryByRole('button', { name: 'Expand' })).not.toBeInTheDocument();
        expect(screen.getByRole('dialog')).toHaveClass('fullScreen');
    });

    it('ensure negative values not to be stored', async () => {
        render(<ValueBox value={value} />, withReduxState());

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
