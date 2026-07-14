import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ValueListBox } from '~/client/pages/products/ValueListBox';

jest.mock('~/client/pages/products/ValueHistoryTab', () => ({
    ProductHistoryTab: jest.fn().mockReturnValue(null),
}));

jest.mock('~/client/pages/products/ValueQuantitiesTab', () => ({
    ProductQuantitiesTab: jest.fn().mockReturnValue(null),
}));

describe('<ValueListBox>', () => {
    afterEach(() => jest.clearAllMocks());

    it('does not render when opened=false', () => {
        render(
            <MockTheme>
                <ValueListBox />
            </MockTheme>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when opened=true', () => {
        render(
            <MockTheme>
                <ValueListBox opened />
            </MockTheme>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closing the modal calls onClose', async () => {
        const onClose = jest.fn();

        render(
            <MockTheme>
                <ValueListBox opened onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onAfterClose after exit transition ends', async () => {
        const onAfterClose = jest.fn();

        const { rerender } = render(
            <MockTheme>
                <ValueListBox opened onAfterClose={onAfterClose} />
            </MockTheme>
        );

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Close' }));

        rerender(
            <MockTheme>
                <ValueListBox opened={false} onAfterClose={onAfterClose} />
            </MockTheme>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });
});
