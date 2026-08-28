import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import type { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';

import { DraggableContent } from '~/client/common/DraggableContent';
import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useGroups } from '~/client/state/groups/useGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import type { Group } from '~/types/data';

vi.mock(import('~/client/state/years/useYears'));
vi.mock(import('~/client/state/groups/useGroups'));
vi.mock(import('~/client/common/hooks/useReorderHandler'));
vi.mock(import('~/client/pages/groups/hooks/useGroupsHasData'));
vi.mock(import('~/client/state/groups/useGetGroups'));
vi.mock(import('~/client/state/groups/useReorderGroups'));
vi.mock(import('~/client/hooks/useLockingLoader'));
vi.mock(import('~/client/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn().mockReturnValue(['', vi.fn()]),
}));
vi.mock(import('~/client/common/DraggableContent'), () => ({
    DraggableContent: vi.fn(({ children }: any) => <>{children}</>),
}));

vi.mock(import('~/client/common/SortableContent'), () => ({
    SortableContent: vi.fn(({ children }: any) => <>{children}</>),
}));

vi.mock(import('~/client/table/DragOverlayTable'), () => ({
    DragOverlayTable: vi.fn(({ children }: any) => (
        <table aria-label="Drag overlay">
            <tbody>{children}</tbody>
        </table>
    )),
}));

vi.mock(import('~/client/pages/groups/GroupsRow'), () => ({
    GroupsRow: vi.fn(({ group, hidden, dragDisabled }: any) => (
        <tr data-group={group.group} data-hidden={String(hidden ?? false)} aria-disabled={dragDisabled ?? false}>
            <td aria-label="Group name" />
            <td>{group.group}</td>
            <td aria-label="Category" />
            <td aria-label="Annual" />
        </tr>
    )),
}));

describe('<GroupsTable>', () => {
    const mockItems: Group[] = getGroupsFixture();
    const mockOnDragEnd = vi.fn();
    const mockGetGroups = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useGroups).mockReturnValue(getGroupsFixture());
        vi.mocked(useQuickFilter).mockReturnValue(['', vi.fn()]);
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useGroupsHasData).mockReturnValue(true);
        vi.mocked(useGetGroups).mockReturnValue(mockGetGroups);
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
                    <GroupsTable />
                </MockRedux>
            </MockTheme>
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');

        expect(rows).toHaveLength(3);
        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent([
            '',
            '',
            'Category',
            'Annual',
            'Review',
        ]);

        const uogienesRow = rows.find((row) => within(row).queryByText('Uogienės'));
        const darzovesRow = rows.find((row) => within(row).queryByText('Daržovės'));

        expect(uogienesRow).toBeInTheDocument();
        expect(darzovesRow).toBeInTheDocument();

        expect(within(uogienesRow!).getAllByRole('cell')).toHaveListWithTextContent(['', 'Uogienės', '', '']);
        expect(within(darzovesRow!).getAllByRole('cell')).toHaveListWithTextContent(['', 'Daržovės', '', '']);
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
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
                        <GroupsTable />
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
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            vi.mocked(useGroups).mockReturnValue([]);
            vi.mocked(useGroupsHasData).mockReturnValue(false);
            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data by quick filter', () => {
            vi.mocked(useQuickFilter).mockReturnValue(['Uog', vi.fn()]);

            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            const rows = screen.getAllByRole('row');
            const uogienesRow = rows.find((row) => within(row).queryByText('Uogienės'));
            const darzovesRow = rows.find((row) => within(row).queryByText('Daržovės'));

            expect(uogienesRow).toBeInTheDocument();
            expect(darzovesRow).toHaveAttribute('data-hidden', 'true');
        });

        it('disables every drag handle while the quick filter is active', () => {
            vi.mocked(useQuickFilter).mockReturnValue(['Uog', vi.fn()]);

            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            const rows = screen.getAllByRole('row').slice(1);

            expect(rows.every((row) => row.getAttribute('aria-disabled') === 'true')).toBe(true);
        });
    });

    describe('handles drag and reorder', () => {
        it('does not call setActive before a drag starts', () => {
            const mockSetActive = vi.fn();
            const state = {
                groups: getGroupsFixture(),
            };

            render(
                <MockApp state={state} setActive={mockSetActive}>
                    <GroupsTable />
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
            };

            render(
                <MockApp state={state} setActive={mockSetActive}>
                    <GroupsTable />
                </MockApp>
            );

            const { onDragStart } = vi.mocked(DraggableContent).mock.calls.at(-1)![0] as { onDragStart: () => void };

            onDragStart();

            expect(mockSetActive).toHaveBeenCalledWith();
        });

        it('configures useReorderHandler with correct callbacks', () => {
            const mockReorderGroups = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useReorderGroups).mockReturnValue(mockReorderGroups);

            const state = {
                groups: getGroupsFixture(),
            };

            render(
                <MockApp state={state}>
                    <GroupsTable />
                </MockApp>
            );

            expect(useReorderHandler).toHaveBeenCalledWith(expect.any(Object));

            const callArgs = vi.mocked(useReorderHandler).mock.calls[0][0];

            expect(callArgs).toHaveProperty('onReorder');
            expect(callArgs).toHaveProperty('equals');
            expect(callArgs).toHaveProperty('resolve');

            const { equals, resolve } = callArgs;

            expect(equals({ group: 'Uogienės' }, { group: 'Uogienės' })).toBe(true);
            expect(equals({ group: 'Uogienės' }, { group: 'Daržovės' })).toBe(false);

            expect(resolve('Uogienės')).toStrictEqual({ group: 'Uogienės' });
            expect(resolve('Daržovės')).toStrictEqual({ group: 'Daržovės' });
        });

        it('calls reorderGroups with correct parameters when onReorder is called', async () => {
            const mockReorderGroups = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useReorderGroups).mockReturnValue(mockReorderGroups);

            const state = {
                groups: getGroupsFixture(),
            };

            render(
                <MockApp state={state}>
                    <GroupsTable />
                </MockApp>
            );

            const callArgs = vi.mocked(useReorderHandler).mock.calls[0][0];
            const { onReorder } = callArgs;

            const reordered: Group[] = [
                { group: 'Daržovės', order: 0 },
                { group: 'Uogienės', order: 1 },
            ];

            await onReorder(reordered, { group: 'Daržovės' });

            expect(mockReorderGroups).toHaveBeenCalledWith({ Daržovės: 0, Uogienės: 1 });
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

        it('returns DragOverlayTable with GroupsRow when the group is found by activeId', () => {
            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(capturedRenderDragOverlay).not.toBeNull();

            const result = capturedRenderDragOverlay!('Uogienės', [100, 200, 300]);
            const { container } = render(<MockTheme>{result as React.ReactElement}</MockTheme>);

            const overlay = within(container).getByRole('table', { name: 'Drag overlay' });

            expect(within(overlay).getByRole('row', { name: 'Uogienės' })).toBeInTheDocument();
        });

        it('returns null when no group matches the activeId', () => {
            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(capturedRenderDragOverlay).not.toBeNull();

            const result = capturedRenderDragOverlay!('NonExistentGroup', [100, 200]);

            expect(result).toBeNull();
        });
    });
});
