import { fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantEditBox } from '~/client/pages/products/VariantEditBox';
import { VariantEditRow, type VariantEditType } from '~/client/pages/products/VariantEditRow';

jest.mock('~/client/pages/products/VariantEditRow', () => ({
    VariantEditRow: jest.fn(jest.requireActual('~/client/pages/products/VariantEditRow').VariantEditRow),
}));

const defaultProps = {
    opened: true,
    group: 'Uogienės',
    name: 'Avietės',
    year: 2024,
    variant: '500g',
    currentAmount: 10,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
};

describe('<VariantEditBox>', () => {
    afterEach(() => jest.clearAllMocks());

    it('does not render when opened=false', () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} opened={false} />
            </MockTheme>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders modal with name, group+year, variant, and result amount when opened=true', () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        expect(screen.getByText('Avietės')).toBeInTheDocument();
        expect(screen.getByText('Uogienės, 2024')).toBeInTheDocument();
        expect(screen.getByText('500g')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders group without year when year is 0', () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} year={0} />
            </MockTheme>
        );

        expect(screen.getByText('Uogienės')).toBeInTheDocument();
        expect(screen.queryByText(/,/)).not.toBeInTheDocument();
    });

    it('update button is disabled when no changes', () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: /Update/ })).toBeDisabled();
    });

    it('passes correct props to each VariantEditRow', () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        const calls = jest.mocked(VariantEditRow).mock.calls;
        const updatedCall = calls.find(([p]) => p.type === 'updated')?.[0];
        const consumedCall = calls.find(([p]) => p.type === 'consumed')?.[0];
        const recycledCall = calls.find(([p]) => p.type === 'recycled')?.[0];

        expect(updatedCall).toMatchObject({ type: 'updated', delta: 0, minDelta: -10 });
        expect(consumedCall).toMatchObject({ type: 'consumed', delta: 0, minDelta: -10 });
        expect(recycledCall).toMatchObject({ type: 'recycled', delta: 0, minDelta: -10 });
    });

    it('clicking Cancel calls onClose without calling onSubmit', async () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: /Cancel/ }));

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('clicking the X close button calls onClose without calling onSubmit', async () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close variant' }));

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('submitting with no changes calls onClose but NOT onSubmit', () => {
        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        const form = screen.getByRole('button', { name: /Update/ }).closest('form')!;
        fireEvent.submit(form);

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('submitting with changes calls onSubmit with correct deltas, then onClose', async () => {
        const consumedValues: Record<VariantEditType, number> = { updated: 0, consumed: -2, recycled: 0 };
        jest.mocked(VariantEditRow).mockImplementation(
            ({
                type,
                onChange,
            }: {
                type: VariantEditType;
                onChange: (type: VariantEditType, value: number) => void;
            }) => (
                <button type="button" onClick={() => onChange(type, consumedValues[type])}>
                    {type}
                </button>
            )
        );

        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'consumed' }));
        await user.click(screen.getByRole('button', { name: /Update/ }));

        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({ updated: 0, consumed: -2, recycled: 0 });
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('update button becomes enabled when a delta changes', async () => {
        const enabledValues: Record<VariantEditType, number> = { updated: 3, consumed: 0, recycled: 0 };
        jest.mocked(VariantEditRow).mockImplementation(
            ({
                type,
                onChange,
            }: {
                type: VariantEditType;
                onChange: (type: VariantEditType, value: number) => void;
            }) => (
                <button type="button" onClick={() => onChange(type, enabledValues[type])}>
                    {type}
                </button>
            )
        );

        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: /Update/ })).toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'updated' }));

        expect(screen.getByRole('button', { name: /Update/ })).not.toBeDisabled();
    });

    it('result amount reflects total delta', async () => {
        const deltaValues: Record<VariantEditType, number> = { updated: 5, consumed: 0, recycled: 0 };
        jest.mocked(VariantEditRow).mockImplementation(
            ({
                type,
                onChange,
            }: {
                type: VariantEditType;
                onChange: (type: VariantEditType, value: number) => void;
            }) => (
                <button type="button" onClick={() => onChange(type, deltaValues[type])}>
                    {type}
                </button>
            )
        );

        render(
            <MockTheme>
                <VariantEditBox {...defaultProps} currentAmount={10} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'updated' }));

        expect(screen.getByText('15')).toBeInTheDocument();
    });
});
