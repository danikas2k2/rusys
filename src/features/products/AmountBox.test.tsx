import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { useEffect } from 'react';

import { AmountBox } from '~/features/products/AmountBox';
import { AmountVariantsTab } from '~/features/products/AmountVariantsTab';
import { ProductYearBar } from '~/features/products/ProductYearBar';

vi.mock(import('~/features/products/AmountHistoryTab'), () => ({
    AmountHistoryTab: vi.fn().mockReturnValue(null),
}));

vi.mock(import('~/features/products/AmountVariantsTab'), () => ({
    AmountVariantsTab: vi.fn().mockReturnValue(null),
}));

vi.mock(import('~/features/products/ProductYearBar'), () => ({
    ProductYearBar: vi.fn(({ onHistoryYearChange }: { onHistoryYearChange: () => void }) => (
        <button onClick={onHistoryYearChange}>Show selected year history</button>
    )),
}));

describe('<AmountBox>', () => {
    type AmountVariantsTabProps = React.ComponentProps<typeof AmountVariantsTab>;

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

    it('renders the product photo thumbnail in the dialog header when given', () => {
        const { container } = render(
            <MockTheme>
                <AmountBox opened photo="/images/ab/cd/photo.png" />
            </MockTheme>
        );

        expect(container.querySelector('img')).toHaveAttribute('src', '/images/ab/cd/photo.png');
    });

    it('falls back to the generic icon in the dialog header when no photo is given', () => {
        const { container } = render(
            <MockTheme>
                <AmountBox opened />
            </MockTheme>
        );

        expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('passes onClose through to AmountVariantsTab so a successful update can close the dialog', () => {
        const onClose = vi.fn();

        render(
            <MockTheme>
                <AmountBox opened onClose={onClose} />
            </MockTheme>
        );

        expect(AmountVariantsTab).toHaveBeenCalledWith(expect.objectContaining({ onClose }), undefined);
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

    it('offers the edit action when an edit handler is supplied', async () => {
        const onEdit = vi.fn();
        render(
            <MockTheme>
                <AmountBox opened onEdit={onEdit} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        expect(onEdit).toHaveBeenCalledExactlyOnceWith();
    });

    it('opens the history tab when the year bar requests it', async () => {
        render(
            <MockTheme>
                <AmountBox opened />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Show selected year history' }));

        expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
    });

    it('closes only the photo viewer when Escape is pressed over it', async () => {
        const onClose = vi.fn();

        render(
            <MockTheme>
                <AmountBox opened photo="/images/ab/cd/photo.png" onClose={onClose} />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'View image' }));
        await user.keyboard('{Escape}');

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    describe('closeOnEscape/closeOnClickOutside', () => {
        // Mantine's own Escape handling is a window-level listener per modal instance, unaware of
        // any other modal stacked on top - a caller opening one there (see ActiveAmountBox) needs
        // to be able to disable this one's own handling for as long as that one is open, or a
        // single Escape press would close both at once.
        it('closes on Escape by default', async () => {
            const onClose = vi.fn();

            render(
                <MockTheme>
                    <AmountBox opened onClose={onClose} />
                </MockTheme>
            );

            await user.keyboard('{Escape}');

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('does not close on Escape when closeOnEscape is false', async () => {
            const onClose = vi.fn();

            render(
                <MockTheme>
                    <AmountBox opened onClose={onClose} closeOnEscape={false} />
                </MockTheme>
            );

            await user.keyboard('{Escape}');

            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('discard confirmation', () => {
        function mockHasChanges(hasChanges: boolean) {
            vi.mocked(AmountVariantsTab).mockImplementation(({ onChangesUpdate }: AmountVariantsTabProps = {}) => {
                useEffect(() => {
                    onChangesUpdate?.(hasChanges);
                }, [onChangesUpdate]);
                return <></>;
            });
        }

        it('passes hasChanges through to ProductYearBar as disabled', () => {
            mockHasChanges(true);

            render(
                <MockTheme>
                    <AmountBox opened />
                </MockTheme>
            );

            expect(ProductYearBar).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }), undefined);
        });

        it('closes without confirmation when there are no unsaved changes', async () => {
            mockHasChanges(false);
            const onClose = vi.fn();

            render(
                <MockTheme>
                    <AmountBox opened onClose={onClose} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Close' }));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when there are unsaved changes', async () => {
            mockHasChanges(true);
            const onClose = vi.fn();

            render(
                <MockTheme>
                    <AmountBox opened onClose={onClose} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Close' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            mockHasChanges(true);
            const onClose = vi.fn();

            render(
                <MockTheme>
                    <AmountBox opened onClose={onClose} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Close' }));
            await user.click(screen.getByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('keeps the dialog open when cancelling the discard confirmation', async () => {
            mockHasChanges(true);
            const onClose = vi.fn();

            render(
                <MockTheme>
                    <AmountBox opened onClose={onClose} />
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Close' }));
            await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
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
