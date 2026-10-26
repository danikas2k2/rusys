import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import { Button } from '@mantine/core';
import type * as Mantine from '@mantine/core';
import React from 'react';

import type * as SubmissionHooks from '~/features/products/hooks/useApplyReview';
import { useApplyReview } from '~/features/products/hooks/useApplyReview';
import { useGetProducts } from '~/features/products/hooks/useGetProducts';
import { ReviewBox } from '~/features/review/ReviewBox';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { Group, Product } from '~/schema';
import { applyReviewAction } from '~/server/actions/products';

vi.mock(import('@mantine/core'), async () => {
    const actual = await vi.importActual<typeof Mantine>('@mantine/core');
    return {
        ...actual,
        Button: vi.fn((props: React.ComponentProps<typeof actual.Button>) => <actual.Button {...props} />),
    };
});

vi.mock(import('~/features/review/ReviewTable'), () => ({
    ReviewTable: vi.fn(({ checkedKeys, onToggle, onSelectAll, onReset }: any) => (
        <section aria-label="Product review">
            <span aria-label="Checked products">{[...checkedKeys].join(',')}</span>
            <button type="button" onClick={() => onToggle('Uogienės:Avietės', true)}>
                check-avietes
            </button>
            <button type="button" onClick={() => onToggle('Uogienės:Braškės', true)}>
                check-braskes
            </button>
            <button type="button" onClick={() => onToggle('Uogienės:Avietės', false)}>
                uncheck-avietes
            </button>
            <button type="button" onClick={() => onSelectAll(['Uogienės:Avietės', 'Uogienės:Braškės'], true)}>
                select-all
            </button>
            <button type="button" onClick={() => onSelectAll(['Uogienės:Avietės', 'Uogienės:Braškės'], false)}>
                unselect-all
            </button>
            <button type="button" onClick={() => onReset(['Uogienės:Avietės', 'Uogienės:Braškės'])}>
                reset
            </button>
        </section>
    )),
}));

vi.mock(import('~/features/products/hooks/useApplyReview'), () => ({
    useApplyReview: vi.fn(),
}));

vi.mock(import('~/lib/observability/faro'), () => ({ trackFaroEvent: vi.fn() }));
vi.mock(import('~/features/products/hooks/useGetProducts'), () => ({ useGetProducts: vi.fn() }));
vi.mock(import('~/server/actions/products'), () => ({
    applyReviewAction: vi.fn(),
    setAmountsAction: vi.fn(),
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
        { group: 'Daržovės', name: 'Morkos', years: [{ year: 2024, amounts: [] }] },
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
            expect(screen.getByLabelText('Checked products')).toHaveTextContent('Uogienės:Avietės');
        });
    });

    it('unchecking a checked item removes it from checkedKeys', async () => {
        render(
            <MockApp state={state}>
                <ReviewBox opened />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'check-avietes' }));
        await user.click(screen.getByRole('button', { name: 'uncheck-avietes' }));

        expect(screen.getByLabelText('Checked products')).toHaveTextContent('');
    });

    it('select-all checks every given key and marks the group as touched', async () => {
        const onClose = vi.fn();

        render(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'select-all' }));

        expect(screen.getByLabelText('Checked products')).toHaveTextContent('Uogienės:Avietės,Uogienės:Braškės');

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    });

    it('select-all with checked=false unchecks every given key without leaving the group untouched', async () => {
        const onClose = vi.fn();

        render(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'select-all' }));
        await user.click(screen.getByRole('button', { name: 'unselect-all' }));

        expect(screen.getByLabelText('Checked products')).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    });

    it('reset returns the group to untouched and removes the given keys from checkedKeys', async () => {
        const onClose = vi.fn();

        render(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'select-all' }));
        await user.click(screen.getByRole('button', { name: 'reset' }));

        expect(screen.getByLabelText('Checked products')).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
    });

    it('resets checked items when the dialog is reopened', async () => {
        const onClose = vi.fn();

        const { rerender } = render(
            <MockApp state={state}>
                <ReviewBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'check-avietes' }));

        expect(screen.getByLabelText('Checked products')).toHaveTextContent('Uogienės:Avietės');

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

        expect(screen.getByLabelText('Checked products')).toHaveTextContent('');
    });

    describe('apply', () => {
        it('sends no updates for a category that was never touched', async () => {
            const onClose = vi.fn();

            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Apply' }));

            expect(applyReview).toHaveBeenCalledWith({ updates: [] });
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('sends missing=true for an unchecked product once its group is touched', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            // Touching any checkbox in the group brings every one of its products into the changeset
            await user.click(screen.getByRole('button', { name: 'check-braskes' }));
            await user.click(screen.getByRole('button', { name: 'Apply' }));

            expect(applyReview).toHaveBeenCalledWith({
                updates: [
                    { group: 'Uogienės', name: 'Avietės', missing: true },
                    { group: 'Uogienės', name: 'Braškės', missing: false },
                ],
            });
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

            expect(applyReview).toHaveBeenCalledWith({
                updates: [{ group: 'Uogienės', name: 'Braškės', missing: false }],
            });
        });

        it('sends no updates when nothing effectively changed', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Apply' }));

            expect(applyReview).toHaveBeenCalledWith({ updates: [] });
        });

        it('excludes products with no years from updates even once the group is touched', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Apply' }));

            const { updates } = applyReview.mock.calls[0][0];

            expect(updates.some((u: any) => u.name === 'Serbentai')).toBe(false);
        });

        it('excludes products from groups not flagged for review even once another group is touched', async () => {
            render(
                <MockApp state={state}>
                    <ReviewBox opened />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            await user.click(screen.getByRole('button', { name: 'Apply' }));

            const { updates } = applyReview.mock.calls[0][0];

            expect(updates.some((u: any) => u.name === 'Morkos')).toBe(false);
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

    describe('review submission telemetry', () => {
        const refresh = vi.fn();

        beforeEach(async () => {
            const actual = await vi.importActual<typeof SubmissionHooks>('../products/hooks/useApplyReview');
            vi.mocked(useApplyReview).mockImplementation(actual.useApplyReview);
            vi.mocked(useGetProducts).mockReturnValue(refresh);
            vi.mocked(applyReviewAction).mockResolvedValue(undefined);
            refresh.mockReset().mockResolvedValue(undefined);
        });

        async function prepareApply(changed: boolean, onClose: () => void) {
            render(
                <MockApp state={state}>
                    <ReviewBox opened onClose={onClose} />
                </MockApp>
            );
            await user.click(screen.getByRole('button', { name: 'check-avietes' }));
            if (changed) {
                await user.click(screen.getByRole('button', { name: 'check-braskes' }));
            }
            const buttonProps = vi
                .mocked(Button)
                .mock.calls.findLast(
                    ([props]) =>
                        React.isValidElement<{ children: string }>(props.children) &&
                        props.children.props.children === 'Apply'
                )![0];
            return buttonProps.onClick as unknown as () => Promise<void>;
        }

        it.each([true, false])('records completion for changed=%s without inventing mutations', async (changed) => {
            const onClose = vi.fn();
            const submit = await prepareApply(changed, onClose);
            vi.mocked(trackFaroEvent).mockClear();

            await act(async () => {
                await submit();
            });

            expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
                ['form_submitted', { form: 'review' }],
                ...(changed
                    ? [
                          ['data_action', { entity: 'review', action: 'apply_review', result: 'started' }],
                          ['data_action', { entity: 'review', action: 'apply_review', result: 'success' }],
                      ]
                    : []),
                ['form_result', { form: 'review', result: 'success' }],
            ]);
            expect(applyReviewAction).toHaveBeenCalledTimes(changed ? 1 : 0);
            expect(onClose).toHaveBeenCalledExactlyOnceWith();
        });

        it.each(['write', 'refresh'] as const)(
            'records form failure on %s rejection and preserves the error',
            async (stage) => {
                const failure = new Error('private details');
                const onClose = vi.fn();
                const operation = { write: vi.mocked(applyReviewAction), refresh }[stage];
                operation.mockRejectedValueOnce(failure);
                const submit = await prepareApply(true, onClose);
                vi.mocked(trackFaroEvent).mockClear();

                await act(async () => {
                    await expect(submit()).rejects.toBe(failure);
                });

                expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([
                    ['form_submitted', { form: 'review' }],
                    ['data_action', { entity: 'review', action: 'apply_review', result: 'started' }],
                    [
                        'data_action',
                        { entity: 'review', action: 'apply_review', result: stage === 'write' ? 'error' : 'success' },
                    ],
                    ['form_result', { form: 'review', result: 'error' }],
                ]);
                expect(onClose).not.toHaveBeenCalled();
            }
        );
    });
});
