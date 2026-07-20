import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveAmountBox } from '~/client/pages/products/ActiveAmountBox';

vi.mock(import('~/client/pages/products/AmountBox'), (): any => ({
    AmountBox: ({ opened, onClose, onAfterClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Value box">
                <button type="button" onClick={() => onClose()}>
                    Close
                </button>
                <button type="button" onClick={onAfterClose}>
                    After close
                </button>
            </div>
        ) : null,
}));

describe('<ActiveAmountBox>', () => {
    const mockSetActive = vi.fn();
    const data = { group: 'Test', name: 'Item', year: 2024 };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders closed when no active content', () => {
        render(
            <MockThemeActive>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Value box' })).not.toBeInTheDocument();
    });

    it('renders closed when action is not values', () => {
        render(
            <MockThemeActive active={{ action: 'update', data }}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Value box' })).not.toBeInTheDocument();
    });

    it('renders opened when action is values and data exists', () => {
        render(
            <MockThemeActive active={{ action: 'values', data }}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
    });

    it('calls setActive with data on close', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(mockSetActive).toHaveBeenCalledWith({ data });
    });

    it('calls setActive without data on after close', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveAmountBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'After close' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });
});
