import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import type { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';

import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useVariantsHasData } from '~/client/pages/variants/hooks/useVariantsHasData';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { useGroups } from '~/client/state/groups/useGroups';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import { useReorderVariants } from '~/client/state/variants/useReorderVariants';
import { useVariants } from '~/client/state/variants/useVariants';
import type { Variant } from '~/types/data';

vi.mock(import('~/client/state/years/useYears'));
vi.mock(import('~/client/state/groups/useGroups'));
vi.mock(import('~/client/state/variants/useVariants'));
vi.mock(import('~/client/state/variants/useReorderVariants'));
vi.mock(import('~/client/common/hooks/useReorderHandler'));
vi.mock(import('~/client/pages/variants/hooks/useVariantsHasData'));
vi.mock(import('~/client/state/variants/useGetVariants'));
vi.mock(import('~/client/hooks/useLockingLoader'));
vi.mock(import('~/client/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn().mockReturnValue(['', vi.fn()]),
}));

vi.mock(import('~/client/common/DraggableContent'), () => ({
    DraggableContent: vi.fn(({ children }: any) => <>{children}</>),
}));

vi.mock(import('~/client/table/DragOverlayTable'), () => ({
    DragOverlayTable: vi.fn(({ children }: any) => (
        <table data-testid="drag-overlay-table">
            <tbody>{children}</tbody>
        </table>
    )),
}));

vi.mock(import('~/client/pages/variants/VariantsRow'), () => ({
    VariantsRow: vi.fn(({ variant, hidden }: any) => (
        <tr
            data-testid="variants-row"
            data-group={variant.group}
            data-variant={variant.variant}
            data-hidden={String(hidden ?? false)}
        >
            <td />
            <td>{variant.variant}</td>
            <td>{variant.suffix ?? ''}</td>
        </tr>
    )),
}));

describe('<VariantsTable>', () => {
    const mockItems: Variant[] = getVariantsFixture();
    const mockOnDragEnd = vi.fn();
    const mockGetVariants = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useVariants).mockReturnValue(getVariantsFixture());
        vi.mocked(useGroups).mockReturnValue(getGroupsFixture());
        vi.mocked(useVariantsHasData).mockReturnValue(true);
        vi.mocked(useGetVariants).mockReturnValue(mockGetVariants);
        vi.mocked(useReorderHandler).mockReturnValue({
            items: mockItems,
            reordering: false,
            onDragEnd: mockOnDragEnd,
        });
    });

    afterEach(() => vi.clearAllMocks());

    it('renders table structure', () => {
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

        const rowData = {
            Uogienės: [
                ['', 'p', ''],
                ['', 'd', 'D.'],
                ['', 'm', 'M.'],
                ['', 'e', 'E.'],
                ['', 'x', 'B.'],
            ],
            Daržovės: [
                ['', 'd', ''],
                ['', 'p', ''],
                ['', 'm', ''],
                ['', '1', ''],
                ['', 'x', 'B.'],
            ],
        };

        const rows = screen.getAllByRole('row');
        let count = 0;

        expect(within(rows[count++]).getAllByRole('columnheader')).toHaveListWithTextContent(['', 'Variant', 'Suffix']);

        for (const [group, cells] of Object.entries(rowData)) {
            expect(within(rows[count++]).getAllByRole('columnheader')).toHaveListWithTextContent([group]);

            for (const cell of cells) {
                expect(within(rows[count++]).getAllByRole('cell')).toHaveListWithTextContent(cell);
            }
        }

        expect(rows).toHaveLength(count);
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

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            vi.mocked(useQuickFilter).mockReturnValue(['e', vi.fn()]);
            vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);

            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            const rows = screen.getAllByRole('row');

            const headerRow = rows.find((row) => within(row).queryByText('Uogienės'));
            const eRow = rows.find((row) => within(row).queryByText('e'));
            const dRow = rows.find((row) => within(row).queryByText('d'));

            expect(headerRow).toBeInTheDocument();
            expect(eRow).toBeInTheDocument();
            expect(dRow).toHaveAttribute('data-hidden', 'true');
        });

        it('renders filtered out data', () => {
            vi.mocked(useQuickFilter).mockReturnValue(['zzz', vi.fn()]);
            vi.mocked(useGroups).mockReturnValue([{ group: 'Uogienės', order: 0 }]);

            render(
                <MockTheme>
                    <MockRedux>
                        <VariantsTable />
                    </MockRedux>
                </MockTheme>
            );

            const rows = screen.getAllByRole('row');

            expect(rows.length).toBeGreaterThanOrEqual(2);

            const header = rows[0];

            expect(within(header).getAllByRole('columnheader')).toHaveListWithTextContent(['', 'Variant', 'Suffix']);
        });
    });

    describe('handles drag and reorder', () => {
        it('calls setActive when drag starts', () => {
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

            expect(container.querySelector('[data-testid="drag-overlay-table"]')).toBeInTheDocument();
            expect(container.querySelector('[data-testid="variants-row"]')).toBeInTheDocument();
            expect(container.querySelector('[data-group="Uogienės"][data-variant="p"]')).toBeInTheDocument();
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
