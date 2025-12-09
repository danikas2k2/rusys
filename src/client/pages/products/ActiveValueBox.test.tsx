import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveValueBox } from '~/client/pages/products/ActiveValueBox';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';

jest.mock('~/client/pages/products/UpdatingProductsContext', () => ({
    useUpdatingProducts: jest.fn(() => [{}, jest.fn()]),
}));

jest.mock('~/client/state/products/useUpdateProduct', () => ({
    useUpdateProduct: jest.fn(() => jest.fn().mockResolvedValue(undefined)),
}));

jest.mock('~/client/state/profile/useProfile', () => ({
    useProfile: jest.fn(() => ({ email: 'test@example.com' })),
}));

jest.mock('~/client/pages/products/AmountBox', () => ({
    ValueBox: ({ opened, onClose, onAfterClose }: any) =>
        opened ? (
            <div role="dialog" aria-label="Value box">
                <button type="button" onClick={() => onClose([{ variant: 'test', amount: 5 }])}>
                    Close with changes
                </button>
                <button type="button" onClick={() => onClose()}>
                    Close without changes
                </button>
                <button type="button" onClick={onAfterClose}>
                    After close
                </button>
            </div>
        ) : null,
}));

describe('<ActiveValueBox>', () => {
    const mockSetActive = jest.fn();
    const mockSetUpdating = jest.fn();
    const mockUpdateProduct = jest.fn().mockResolvedValue(undefined);
    const data = { group: 'Test', name: 'Item', year: 2024 };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useUpdatingProducts).mockReturnValue([{}, mockSetUpdating]);
        jest.mocked(useUpdateProduct).mockReturnValue(mockUpdateProduct);
    });

    it('renders closed when no active content', () => {
        render(
            <MockThemeActive>
                <ActiveValueBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Value box' })).not.toBeInTheDocument();
    });

    it('renders closed when action is not values', () => {
        render(
            <MockThemeActive active={{ action: 'update', data }}>
                <ActiveValueBox />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Value box' })).not.toBeInTheDocument();
    });

    it('renders opened when action is values and data exists', () => {
        render(
            <MockThemeActive active={{ action: 'values', data }}>
                <ActiveValueBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Value box' })).toBeInTheDocument();
    });

    it('calls updateProduct and setActive on close with changes', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveValueBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Close with changes' }));

        expect(mockSetUpdating).toHaveBeenCalledWith(data, true);
        expect(mockUpdateProduct).toHaveBeenCalledWith(
            'Test',
            'Item',
            2024,
            [{ variant: 'test', amount: 5 }],
            'test@example.com'
        );
        expect(mockSetActive).toHaveBeenCalledWith({ data });
    });

    it('clears active data on close even without changes', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveValueBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Close without changes' }));

        expect(mockSetActive).toHaveBeenCalledWith({ data });
    });

    it('does not call updateProduct on close without changes', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveValueBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Close without changes' }));

        expect(mockUpdateProduct).not.toHaveBeenCalled();
        expect(mockSetActive).toHaveBeenCalledWith({ data });
    });

    it('calls setActive without data on after close', async () => {
        render(
            <MockThemeActive active={{ action: 'values', data }} setActive={mockSetActive}>
                <ActiveValueBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'After close' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });
});
