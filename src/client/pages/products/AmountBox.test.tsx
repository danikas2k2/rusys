import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React, { useEffect } from 'react';

import { AmountBox } from '~/client/pages/products/AmountBox';
import { AmountVariantsTab } from '~/client/pages/products/AmountVariantsTab';
import { ProductYearBar } from '~/client/pages/products/ProductYearBar';

vi.mock(import('~/client/pages/products/AmountHistoryTab'), () => ({
    AmountHistoryTab: vi.fn().mockReturnValue(null),
}));

vi.mock(import('~/client/pages/products/AmountVariantsTab'), () => ({
    AmountVariantsTab: vi.fn().mockReturnValue(null),
}));

vi.mock(import('~/client/pages/products/ProductYearBar'), () => ({
    ProductYearBar: vi.fn().mockReturnValue(null),
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

    it('renders the product image in the dialog header watermark when given', () => {
        const { container } = render(
            <MockTheme>
                <AmountBox opened image="/images/ab/cd/product.png" />
            </MockTheme>
        );

        expect(container.querySelector('img')).toHaveAttribute('src', '/images/ab/cd/product.png');
    });

    it('falls back to the generic icon in the dialog header when no image is given', () => {
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

    describe('discard confirmation', () => {
        function mockHasChanges(hasChanges: boolean) {
            vi.mocked(AmountVariantsTab).mockImplementation(
                ({ onChangesUpdate }: { onChangesUpdate?: (hasChanges: boolean) => void }) => {
                    useEffect(() => {
                        onChangesUpdate?.(hasChanges);
                    }, [onChangesUpdate]);
                    return null;
                }
            );
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
