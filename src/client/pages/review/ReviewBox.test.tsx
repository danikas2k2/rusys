import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { ReviewBox } from '~/client/pages/review/ReviewBox';
import { useApplyReview } from '~/client/state/products/useApplyReview';
import type { Group, Product } from '~/types/data';

vi.mock(import('~/client/pages/review/ReviewTable'), () => ({
    ReviewTable: vi.fn(({ checkedKeys, onToggle }: any) => (
        <div data-testid="review-table">
            <span data-testid="checked-keys">{[...checkedKeys].join(',')}</span>
            <button type="button" onClick={() => onToggle('Uogienės:Avietės', true)}>
                check-avietes
            </button>
            <button type="button" onClick={() => onToggle('Uogienės:Braškės', true)}>
                check-braskes
            </button>
        </div>
    )),
}));

vi.mock(import('~/client/state/products/useApplyReview'), () => ({
    useApplyReview: vi.fn(),
}));

describe('<ReviewBox>', () => {
    const groups: Group[] = [
        { group: 'Uogienės', order: 0, review: true },
        { group: 'Daržovės', order: 1, review: false },
    ];
    const products: Product[] = [
        { group: 'Uogienės', name: 'Avietės', years: [{ year: 2024, amounts: [] }], missing: false },
        { group: 'Uogienės', name: 'Braškės', years: [{ year: 2024, amounts: [] }], missing: true },
        { group: 'Uogienės', name: 'Serbentai', years: [] },
        { group: 'Daržovės', name: 'Agurkai', years: [{ year: 2024, amounts: [] }] },
    ];
    const state = { groups, products };
    const applyReview = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useApplyReview).mockReturnValue(applyReview);
    });

    afterEach(() => vi.clearAllMocks());

    it('does not render when opened=false', () => {
        render(
            <MockApp state={state}>
                <ReviewBox />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders when opened=true', () => {
        render(
            <MockApp state={state}>
                <ReviewBox opened />
            </MockApp>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closing the modal calls onClose', async () => {
        const onClose = vi.fn();

        render(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    describe('discard confirmation', () => {
        it('closes without confirmation when nothing was checked', async () => {
            const onClose = vi.fn();

            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when something was checked', async () => {
            const onClose = vi.fn();

            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            const onClose = vi.fn();

            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(screen.getByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('keeps the dialog open and keeps the checked item when cancelling the discard confirmation', async () => {
            const onClose = vi.fn();

            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('checked-keys')).toHaveTextContent('Uogienės:Avietės');
        });
    });

    it('resets checked items when the dialog is reopened', async () => {
        const onClose = vi.fn();

        const { rerender } = render(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'check-avietes' }));

        expect(screen.getByTestId('checked-keys')).toHaveTextContent('Uogienės:Avietės');

        rerender(
            <MockApp state={state}>
                <ReviewBox opened={false} onClose={onClose} />
            </MockApp>
        );
        rerender(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByTestId('checked-keys')).toHaveTextContent('');
    });

    describe('apply', () => {
        it('sends missing=true for a previously-present product left unchecked, closes without confirmation', async () => {
            const onClose = vi.fn();

            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Apply' }));

            expect(applyReview).toHaveBeenCalledWith([{ group: 'Uogienės', name: 'Avietės', missing: true }]);
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('sends missing=false for a previously-missing product that gets checked', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'check-braskes' }));
            await user.click(screen.getByRole('button', { name: 'Apply' }));

            expect(applyReview).toHaveBeenCalledWith([{ group: 'Uogienės', name: 'Braškės', missing: false }]);
        });

        it('sends no updates when nothing effectively changed', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Apply' }));

            expect(applyReview).toHaveBeenCalledWith([]);
        });

        it('excludes products with no years from updates regardless of state', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Apply' }));

            const updates = applyReview.mock.calls[0][0];

            expect(updates.some((u: any) => u.name === 'Serbentai')).toBe(false);
        });

        it('excludes products from groups not flagged for review', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Apply' }));

            const updates = applyReview.mock.calls[0][0];

            expect(updates.some((u: any) => u.name === 'Agurkai')).toBe(false);
        });
    });

    it('calls onAfterClose after exit transition ends', async () => {
        const onAfterClose = vi.fn();

        const { rerender } = render(
            <MockApp state={state}>
                <ReviewBox opened onAfterClose={onAfterClose} />
            </MockApp>
        );

        const dialog = await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Close' }));

        rerender(
            <MockApp state={state}>
                <ReviewBox opened={false} onAfterClose={onAfterClose} />
            </MockApp>
        );

        act(() => fireEvent.transitionEnd(dialog));

        await waitFor(() => {
            expect(onAfterClose).toHaveBeenCalledWith();
        });
    });
});
