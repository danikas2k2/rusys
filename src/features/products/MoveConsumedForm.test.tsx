import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Select } from '@mantine/core';
import React from 'react';

import { MoveConsumedForm } from '~/features/products/MoveConsumedForm';
import type { VariantAmount } from '~/schema';

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

    it('uses dialog actions to cancel or submit the selected quantity', async () => {
        const onCancel = vi.fn();
        const line: VariantAmount = { variant: 'd', amount: -3, recycled: false };
        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={[line]} onMove={onMove} onCancel={onCancel} />
            </MockApp>
        );
        const submit = screen.getByRole('button', { name: 'Recycle' });
        const input = screen.getByRole('textbox', { name: 'Amount' });

        expect(submit).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Cancel' }).querySelector('.tabler-icon-x')).toBeInTheDocument();
        expect(input.closest('.move-consumed-form')?.querySelector('.tabler-icon-recycle')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(submit);

        expect(onMove).toHaveBeenCalledWith(line, 1);

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCancel).toHaveBeenCalledExactlyOnceWith();
    });

    it('disables both dialog actions while saving', () => {
        render(
            <MockApp>
                <MoveConsumedForm
                    group="Daržovės"
                    lines={[{ variant: 'd', amount: -1 }]}
                    onMove={onMove}
                    onCancel={vi.fn()}
                    disabled
                />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Recycle' })).toBeDisabled();
    });

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
        expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
        expect(screen.getAllByRole('button').every((button) => !!button.getAttribute('aria-label'))).toBe(true);
    });

    it('does not submit a zero amount with Enter', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '{Enter}');

        expect(onMove).not.toHaveBeenCalled();
    });

    it('does not show Decrease button once amount reaches the line max', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -2, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-2');
        expect(onMove).not.toHaveBeenCalled();
        expect(screen.queryByRole('button', { name: 'Decrease' })).not.toBeInTheDocument();
    });

    it('returns focus to the amount when keyboard controls reach either boundary', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -1, recycled: false }];
        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );
        const input = screen.getByRole('textbox', { name: 'Amount' });
        screen.getByRole('button', { name: 'Decrease' }).focus();
        await user.keyboard('{Enter}');

        expect(input).toHaveFocus();
        expect(input).toHaveValue('-1');

        screen.getByRole('button', { name: 'Increase' }).focus();
        await user.keyboard('{Enter}');

        expect(input).toHaveFocus();
        expect(input).toHaveValue('0');
    });

    it('decreases the amount by one when Increase is clicked, hiding it again at zero', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -2, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Decrease' }));
        await user.click(screen.getByRole('button', { name: 'Decrease' }));

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-2');

        screen.getByRole('button', { name: 'Increase' }).focus();
        await user.keyboard('{Enter}');

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-1');
        expect(onMove).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Increase' }));

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('0');
        expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
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

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '2');
        await user.type(screen.getByRole('textbox', { name: 'Amount' }), 'abc');
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

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '10');

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-2');
    });

    it('accepts a negative quantity and submits its positive magnitude', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];
        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        const input = screen.getByRole('textbox', { name: 'Amount' });
        await user.clear(input);
        await user.type(input, '-2');

        expect(input).toHaveValue('-2');

        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));

        expect(onMove).toHaveBeenCalledWith(lines[0], 2);
    });

    it('calls onMove with the selected line and amount, retaining the input while saving', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '2');
        await user.click(screen.getByRole('button', { name: 'Move to discarded' }));

        expect(onMove).toHaveBeenCalledWith(lines[0], 2);
        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-2');
    });

    it('submits the valid amount with Enter', async () => {
        const lines: VariantAmount[] = [{ variant: 'd', amount: -3, recycled: false }];

        render(
            <MockApp>
                <MoveConsumedForm group="Daržovės" lines={lines} onMove={onMove} />
            </MockApp>
        );

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '2{Enter}');

        expect(onMove).toHaveBeenCalledWith(lines[0], 2);
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

        expect(screen.getByRole('textbox', { name: 'Amount' })).toBeDisabled();
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

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '3');

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-3');

        await user.selectOptions(screen.getByRole('combobox'), 'p');

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('0');

        await user.type(screen.getByRole('textbox', { name: 'Amount' }), '5');

        expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('-1');
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
