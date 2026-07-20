import { fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { AmountVariantRow } from '~/client/pages/products/AmountVariantRow';

describe('<AmountVariantRow>', () => {
    const onChange = vi.fn();

    afterEach(() => vi.clearAllMocks());

    describe('rendering', () => {
        it('renders input with correct delta value for updated type', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={5} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('textbox', { name: 'updated' })).toHaveValue('5');
        });

        it('renders input with correct delta value for consumed type', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-3} minDelta={-10} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('textbox', { name: 'consumed' })).toHaveValue('-3');
        });

        it('renders input with correct delta value for recycled type', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="recycled" delta={-1} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('textbox', { name: 'recycled' })).toHaveValue('-1');
        });
    });

    describe('updated type — Decrease button', () => {
        it('shows Decrease button when delta > minDelta', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={1} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
        });

        it('does not show Decrease button when delta === minDelta', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={0} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.queryByRole('button', { name: 'Decrease' })).not.toBeInTheDocument();
        });

        it('clicking Decrease calls onChange with delta - 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={3} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Decrease' }));

            expect(onChange).toHaveBeenCalledWith('updated', 2);
        });
    });

    describe('updated type — Increase button', () => {
        it('shows Increase button (no upper bound)', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={100} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
        });

        it('clicking Increase calls onChange with delta + 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={3} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Increase' }));

            expect(onChange).toHaveBeenCalledWith('updated', 4);
        });
    });

    describe('updated type — keyboard', () => {
        it('arrowUp calls onChange with delta + 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={2} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox', { name: 'updated' }), '{ArrowUp}');

            expect(onChange).toHaveBeenCalledWith('updated', 3);
        });

        it('arrowDown calls onChange with delta - 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={2} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox', { name: 'updated' }), '{ArrowDown}');

            expect(onChange).toHaveBeenCalledWith('updated', 1);
        });

        it('arrowDown at minDelta does not show Decrease button', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={0} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.queryByRole('button', { name: 'Decrease' })).not.toBeInTheDocument();
        });
    });

    describe('consumed type — Decrease button', () => {
        it('shows Decrease button when delta > minDelta', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-1} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
        });

        it('does not show Decrease button when delta === minDelta', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-5} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.queryByRole('button', { name: 'Decrease' })).not.toBeInTheDocument();
        });

        it('clicking Decrease calls onChange with delta - 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-1} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Decrease' }));

            expect(onChange).toHaveBeenCalledWith('consumed', -2);
        });
    });

    describe('consumed type — Increase button', () => {
        it('shows Increase button when delta < 0', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-2} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
        });

        it('does not show Increase button when delta === 0', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={0} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
        });

        it('clicking Increase calls onChange with delta + 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-2} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Increase' }));

            expect(onChange).toHaveBeenCalledWith('consumed', -1);
        });
    });

    describe('consumed type — keyboard', () => {
        it('arrowUp calls onChange with delta + 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-2} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox', { name: 'consumed' }), '{ArrowUp}');

            expect(onChange).toHaveBeenCalledWith('consumed', -1);
        });

        it('arrowDown calls onChange with delta - 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-2} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            await user.type(screen.getByRole('textbox', { name: 'consumed' }), '{ArrowDown}');

            expect(onChange).toHaveBeenCalledWith('consumed', -3);
        });
    });

    describe('recycled type', () => {
        it('does not show Increase button when delta === 0', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="recycled" delta={0} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
        });

        it('clicking Decrease calls onChange with delta - 1', async () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="recycled" delta={-1} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Decrease' }));

            expect(onChange).toHaveBeenCalledWith('recycled', -2);
        });
    });

    describe('handleChange', () => {
        it('negates positive input for consumed type', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={0} minDelta={-10} onChange={onChange} />
                </MockTheme>
            );

            fireEvent.change(screen.getByRole('textbox', { name: 'consumed' }), { target: { value: '2' } });

            expect(onChange).toHaveBeenCalledWith('consumed', -2);
        });

        it('negates positive input for recycled type', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="recycled" delta={0} minDelta={-10} onChange={onChange} />
                </MockTheme>
            );

            fireEvent.change(screen.getByRole('textbox', { name: 'recycled' }), { target: { value: '5' } });

            expect(onChange).toHaveBeenCalledWith('recycled', -5);
        });

        it('does not negate input for updated type', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={0} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            fireEvent.change(screen.getByRole('textbox', { name: 'updated' }), { target: { value: '4' } });

            expect(onChange).toHaveBeenCalledWith('updated', 4);
        });

        it('clamps value to minDelta for consumed type when input is below minDelta', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={0} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            fireEvent.change(screen.getByRole('textbox', { name: 'consumed' }), { target: { value: '10' } });

            expect(onChange).toHaveBeenCalledWith('consumed', -5);
        });

        it('negates negative string input for consumed type (abs then negate)', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="consumed" delta={-2} minDelta={-5} onChange={onChange} />
                </MockTheme>
            );

            fireEvent.change(screen.getByRole('textbox', { name: 'consumed' }), { target: { value: '-3' } });

            expect(onChange).toHaveBeenCalledWith('consumed', -3);
        });

        it('returns early and does not call onChange for NaN input', () => {
            render(
                <MockTheme>
                    <AmountVariantRow type="updated" delta={5} minDelta={0} onChange={onChange} />
                </MockTheme>
            );

            fireEvent.change(screen.getByRole('textbox', { name: 'updated' }), { target: { value: '' } });

            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
