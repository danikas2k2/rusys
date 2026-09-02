import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import type { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';

import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useVariantsHasData } from '~/client/pages/variants/hooks/useVariantsHasData';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { useGroups } from '~/client/state/groups/useGroups';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { useVariants } from '~/client/state/variants/useVariants';
import type { Variant } from '~/common/data';

vi.mock(import('~/client/state/years/useYears'));
vi.mock(import('~/client/state/groups/useGroups'));
vi.mock(import('~/client/state/variants/useVariants'));
vi.mock(import('~/client/state/variants/useReorderVariants'));
vi.mock(import('~/client/common/hooks/useReorderHandler'));
vi.mock(import('~/client/pages/variants/hooks/useVariantsHasData'));
vi.mock(import('~/client/state/variants/useGetVariants'));
vi.mock(import('~/client/hooks/useLockingLoader'));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));
vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));
vi.mock(import('~/client/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn(),
}));

vi.mock(import('~/client/common/DraggableContent'), () => ({
    DraggableContent: vi.fn(({ children }: any) => <>{children}</>),
}));

vi.mock(import('~/client/table/DragOverlayTable'), () => ({
    DragOverlayTable: vi.fn(({ children }: any) => (
        <table aria-label="Drag overlay">
            <tbody>{children}</tbody>
        </table>
    )),
}));

vi.mock(import('~/client/pages/variants/VariantsRow'), () => ({
    VariantsRow: vi.fn(({ variant, hidden, dragDisabled }: any) => (
        <tr
            data-group={variant.group}
            data-variant={variant.variant}
            data-hidden={String(hidden ?? false)}
            aria-disabled={dragDisabled ?? false}
        >
            <td aria-label="blank" />
            <td>{variant.variant}</td>
            <td>{variant.suffix ?? ''}</td>
        </tr>
    )),
}));

describe('<VariantsTable>', () => {
    const allVariants: Variant[] = getVariantsFixture();
    const uogienesVariants = allVariants.filter((v) => v.group === 'Uogienės');
    const mockOnDragEnd = vi.fn();
    const mockGetVariants = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useVariants).mockReturnValue(allVariants);
        vi.mocked(useGroups).mockReturnValue(getGroupsFixture());
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
        vi.mocked(useQuickFilter).mockReturnValue(['', vi.fn()]);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useVariantsHasData).mockReturnValue(true);
        vi.mocked(useGetVariants).mockReturnValue(mockGetVariants);
        vi.mocked(useReorderHandler).mockReturnValue({
            items: uogienesVariants,
            reordering: false,
            onDragEnd: mockOnDragEnd,
        });
    });

    afterEach(() => vi.clearAllMocks());

    it('renders only the selected group variants, without group headings', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');

        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['', 'Variant', 'Suffix']);

        const dataRows = rows.slice(1);

        expect(dataRows).toHaveLength(uogienesVariants.length);

        dataRows.forEach((row, index) => {
            expect(within(row).getAllByRole('cell')).toHaveListWithTextContent([
                '',
                uogienesVariants[index]!.variant,
                uogienesVariants[index]!.suffix ?? '',
            ]);
        });
    });

    it('passes only the selected group variants to useReorderHandler', () => {
        render(
            <MockTheme>
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            </MockTheme>
        );

        const callArgs = vi.mocked(useReorderHandler).mock.calls[0]![0];

        expect(callArgs.items).toHaveLength(uogienesVariants.length);
        expect(callArgs.items.every((v: Variant) => v.group === 'Uogienės')).toBe(true);
    });

    it('re-filters when the selected group changes', () => {
        const darzovesVariants = allVariants.filter((v) => v.group === 'Daržovės');
        vi.mocked(useGroupFilter).mockReturnValue(['Daržovės', vi.fn()]);

        render(
            <MockTheme>
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            </MockTheme>
        );

        const callArgs = vi.mocked(useReorderHandler).mock.calls[0]![0];

        expect(callArgs.items).toHaveLength(darzovesVariants.length);
        expect(callArgs.items.every((v: Variant) => v.group === 'Daržovės')).toBe(true);
    });

    it('hides variants that do not match the quick filter', () => {
        vi.mocked(useQuickFilterPredicate).mockReturnValue((variant: string) => variant === 'p');

        render(
            <MockTheme>
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            </MockTheme>
        );

        const rows = screen.getAllByRole('row').slice(1);

        expect(rows.find((row) => row.dataset.variant === 'p')).toHaveAttribute('data-hidden', 'false');
        expect(rows.filter((row) => row.dataset.variant !== 'p').every((row) => row.dataset.hidden === 'true')).toBe(
            true
        );
    });

    it('disables every drag handle while the quick filter is active', () => {
        vi.mocked(useQuickFilter).mockReturnValue(['p', vi.fn()]);

        render(
            <MockTheme>
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            </MockTheme>
        );

        const rows = screen.getAllByRole('row').slice(1);

        expect(rows.every((row) => row.getAttribute('aria-disabled') === 'true')).toBe(true);
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            vi.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without variants', () => {
            vi.mocked(useVariants).mockReturnValue([]);
            vi.mocked(useVariantsHasData).mockReturnValue(false);
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            vi.mocked(useGroups).mockReturnValue([]);
            vi.mocked(useVariantsHasData).mockReturnValue(false);
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles drag and reorder', () => {
        it('does not call setActive before a drag starts', () => {
            const mockSetActive = vi.fn();
            const state = {
                groups: getGroupsFixture(),
                variants: getVariantsFixture(),
            };

            render(
                <MockApp state={state} setActive={mockSetActive}>
                    <VariantsTable />
                </MockApp>
            );

            expect(mockSetActive).not.toHaveBeenCalled();

            const table = screen.getByRole('table');

            expect(table).toBeInTheDocument();
        });

        it('clears the active content once a drag starts', () => {
            const mockSetActive = vi.fn();
            const state = {
                groups: getGroupsFixture(),
                variants: getVariantsFixture(),
            };

            render(
                <MockApp state={state} setActive={mockSetActive}>
                    <VariantsTable />
                </MockApp>
            );

            const { onDragStart } = vi.mocked(DraggableContent).mock.calls.at(-1)![0] as { onDragStart: () => void };

            onDragStart();

            expect(mockSetActive).toHaveBeenCalledWith();
        });

        it('configures useReorderHandler with correct callbacks', () => {
            const mockReorderVariants = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useReorderVariants).mockReturnValue(mockReorderVariants);

            const state = {
                groups: getGroupsFixture(),
                variants: getVariantsFixture(),
            };

            render(
                <MockApp state={state}>
                    <VariantsTable />
                </MockApp>
            );

            expect(useReorderHandler).toHaveBeenCalledWith(expect.any(Object));

            const callArgs = vi.mocked(useReorderHandler).mock.calls[0][0];

            expect(callArgs).toHaveProperty('onReorder');
            expect(callArgs).toHaveProperty('equals');
            expect(callArgs).toHaveProperty('resolve');

            const { equals, resolve } = callArgs;

            expect(equals({ group: 'Uogienės', variant: 'p' }, { group: 'Uogienės', variant: 'p' })).toBe(true);
            expect(equals({ group: 'Uogienės', variant: 'p' }, { group: 'Uogienės', variant: 'd' })).toBe(false);
            expect(equals({ group: 'Uogienės', variant: 'p' }, { group: 'Daržovės', variant: 'p' })).toBe(false);

            expect(resolve('Uogienės:p')).toStrictEqual({ group: 'Uogienės', variant: 'p' });
            expect(resolve('Daržovės:d')).toStrictEqual({ group: 'Daržovės', variant: 'd' });
        });

        it('calls reorderVariants with correct parameters when onReorder is called', async () => {
            const mockReorderVariants = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useReorderVariants).mockReturnValue(mockReorderVariants);

            const state = {
                groups: getGroupsFixture(),
                variants: getVariantsFixture(),
            };

            render(
                <MockApp state={state}>
                    <VariantsTable />
                </MockApp>
            );

            const callArgs = vi.mocked(useReorderHandler).mock.calls[0][0];
            const { onReorder } = callArgs;

            const reordered: Variant[] = [
                { group: 'Uogienės', variant: 'd', order: 0, suffix: 'D.' },
                { group: 'Uogienės', variant: 'p', order: 1, suffix: '' },
            ];

            await onReorder(reordered, { group: 'Uogienės', variant: 'd' });

            expect(mockReorderVariants).toHaveBeenCalledWith('Uogienės', { d: 0, p: 1 });
        });
    });

    describe('renderDragOverlay', () => {
        let capturedRenderDragOverlay: ((activeId: UniqueIdentifier, columns: number[]) => React.ReactNode) | null =
            null;

        beforeEach(() => {
            capturedRenderDragOverlay = null;
            vi.mocked(DraggableContent).mockImplementation(({ renderDragOverlay, children }: any) => {
                capturedRenderDragOverlay = renderDragOverlay ?? null;
                return <>{children}</>;
            });
        });

        it('returns DragOverlayTable with VariantsRow when the variant is found by activeId', () => {
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(capturedRenderDragOverlay).not.toBeNull();

            // 'Uogienės:p' is the getId result for { group: 'Uogienės', variant: 'p' }
            const result = capturedRenderDragOverlay!('Uogienės:p', [100, 200, 300]);
            const { container } = render(<MockTheme>{result as React.ReactElement}</MockTheme>);

            const overlay = within(container).getByRole('table', { name: 'Drag overlay' });

            expect(overlay.querySelector('tr[data-variant="p"]')).toBeInTheDocument();
        });

        it('returns null when no variant matches the activeId', () => {
            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(capturedRenderDragOverlay).not.toBeNull();

            const result = capturedRenderDragOverlay!('NonExistent:zzz', [100, 200]);

            expect(result).toBeNull();
        });
    });
});
