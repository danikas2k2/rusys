import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Select } from '@mantine/core';
import React from 'react';

import type { VariantAmount } from '~/common/data';
import { MoveConsumedForm } from '~/features/products/MoveConsumedForm';

vi.mock(import('~/store/variants/useVariant'), (): any => ({
    useVariant: vi.fn(() => undefined),
}));

vi.mock(import('@mantine/core'), async () => {
    const actual = await vi.importActual('@mantine/core');
    return {
        ...actual,
        Select: vi.fn(({ data, value, onChange }: any) => (
            <select value={value} onChange={(e) => onChange(e.target.value)}>
                {(data as any[]).map((item: any) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
        )),
    };
});

describe('<MoveConsumedForm>', () => {
    const onMove = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('shows the variant as static text when there is only one line', () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        expect(screen.getByText('d')).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('shows a select when there are multiple lines', () => {
        const lines: VariantAmount[] = [
            { variant: 'd', amount: -3, recycled: false },
            { variant: 'p', amount: -1, recycled: false },
        ];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('disables the move button while amount is zero', () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Move to discarded' })).toBeDisabled();
    });

    it('does not show Increase button once amount reaches the line max', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -2, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Increase' }));
        await user.click(screen.getByRole('button', { name: 'Increase' }));

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('2');
        expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
    });

    it('decreases the amount by one when Decrease is clicked, hiding it again at zero', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -2, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Increase' }));
        await user.click(screen.getByRole('button', { name: 'Increase' }));

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('2');

        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('1');

        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('0');
        expect(screen.queryByRole('button', { name: 'Decrease' })).not.toBeInTheDocument();
    });

    it('renders nothing when there are no lines', () => {
        const { container } = render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={[]} onMove={onMove} />
            </MockApp>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('ignores non-numeric input, keeping the last valid amount', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'amount' }), '2');
        await user.type(screen.getByRole('textbox', { name: 'amount' }), 'abc');
        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));

        expect(onMove).toHaveBeenCalledWith(lines[0], 2);
    });

    it('clamps typed input to the line max', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -2, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'amount' }), '10');

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('2');
    });

    it('calls onMove with the selected line and amount, then resets the input', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'amount' }), '2');
        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));

        expect(onMove).toHaveBeenCalledWith(lines[0], 2);
        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('0');
    });

    it('sorts the variant select by variant order, not by the order lines were passed in', () => {
        const lines: VariantAmount[] = [
            { variant: 'd', amount: -3, recycled: false },
            { variant: 'p', amount: -1, recycled: false },
        ];

        render(
            <MockApp
                state={{
                    variants: [
                        { group: 'Daržovės', variant: 'p', order: 0 },
                        { group: 'Daržovės', variant: 'd', order: 1 },
                    ],
                }}
            >
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        expect(screen.getAllByRole('option').map((o) => o.textContent)).toStrictEqual(['p', 'd']);
    });

    it('disables the input and move button when disabled', () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} disabled />
            </MockApp>
        );

        expect(screen.getByRole('textbox', { name: 'amount' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Move to discarded' })).toBeDisabled();
    });

    it('resets the amount and re-bounds max when switching the selected variant', async () => {
        const lines: VariantAmount[] = [
            { variant: 'd', amount: -3, recycled: false },
            { variant: 'p', amount: -1, recycled: false },
        ];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'amount' }), '3');

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('3');

        await user.selectOptions(screen.getByRole('combobox'), 'p');

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('0');

        await user.type(screen.getByRole('textbox', { name: 'amount' }), '5');

        expect(screen.getByRole('textbox', { name: 'amount' })).toHaveValue('1');
    });

    it('resets to the first line when the Select reports a null value', () => {
        const lines: VariantAmount[] = [
            { variant: 'd', amount: -3, recycled: false },
            { variant: 'p', amount: -1, recycled: false },
        ];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        const { onChange } = vi.mocked(Select).mock.calls.at(-1)![0] as { onChange: (v: string | null) => void };

        onChange(null);

        expect(screen.getByRole('combobox')).toHaveValue('0');
    });
});
