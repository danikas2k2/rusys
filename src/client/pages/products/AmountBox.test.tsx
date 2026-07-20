import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { AmountBox } from '~/client/pages/products/AmountBox';

vi.mock(import('~/client/pages/products/AmountHistoryTab'), () => ({
    AmountHistoryTab: vi.fn().mockReturnValue(null),
}));

vi.mock(import('~/client/pages/products/AmountVariantsTab'), () => ({
    AmountVariantsTab: vi.fn().mockReturnValue(null),
}));

describe('<AmountBox>', () => {
    afterEach(() => vi.clearAllMocks());

    it('does not render when opened=false', () => {
        render(
            <MockTheme>
                <AmountBox />
            </MockTheme>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when opened=true', () => {
        render(
            <MockTheme>
                <AmountBox opened />
            </MockTheme>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closing the modal calls onClose', async () => {
        const onClose = vi.fn();

        render(
            <MockTheme>
                <AmountBox opened onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onAfterClose after exit transition ends', async () => {
        const onAfterClose = vi.fn();

        const { rerender } = render(
            <MockTheme>
                <AmountBox opened onAfterClose={onAfterClose} />
            </MockTheme>
        );

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Close' }));

        rerender(
            <MockTheme>
                <AmountBox opened={false} onAfterClose={onAfterClose} />
            </MockTheme>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });
});
