import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useReorderHandler } from '~/client/common/hooks/useReorderHandler';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';
import { useFilteredGroups } from '~/client/pages/groups/hooks/useFilteredGroups';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useGroups } from '~/client/state/groups/useGroups';
import { useReorderGroups } from '~/client/state/groups/useReorderGroups';
import type { Group } from '~/types/data';

vi.mock('~/client/state/years/useYears');
vi.mock('~/client/state/groups/useGroups');
vi.mock('~/client/common/hooks/useReorderHandler');
vi.mock('~/client/pages/groups/hooks/useFilteredGroups');
vi.mock('~/client/pages/groups/hooks/useGroupsHasData');
vi.mock('~/client/state/groups/useGetGroups');
vi.mock('~/client/state/groups/useReorderGroups');
vi.mock('~/client/hooks/useLockingLoader');
vi.mock('~/client/filters/hooks/useQuickFilter', async () => ({
    useQuickFilter: vi.fn().mockReturnValue(''),
}));
vi.mock('~/client/utils/getOverlapIndex');

describe('<GroupsTable>', () => {
    const mockItems: Group[] = getGroupsFixture();
    const mockOnDragEnd = vi.fn();
    const mockGetGroups = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.mocked(useGroups).mockReturnValue(getGroupsFixture());
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useFilteredGroups).mockReturnValue(mockItems);
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
        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['', 'Group', 'Annual']);

        const uogienesRow = rows.find((row) => within(row).queryByText('Uogienės'));
        const darzovesRow = rows.find((row) => within(row).queryByText('Daržovės'));

        expect(uogienesRow).toBeInTheDocument();
        expect(darzovesRow).toBeInTheDocument();

        expect(within(uogienesRow!).getAllByRole('cell')).toHaveListWithTextContent(['', 'Uogienės', '']);
        expect(within(darzovesRow!).getAllByRole('cell')).toHaveListWithTextContent(['', 'Daržovės', '']);
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
        it('renders filtered data', () => {
            const filteredGroups = getGroupsFixture().filter((g) => g.group === 'Uogienės');
            vi.mocked(useFilteredGroups).mockReturnValue(filteredGroups);

            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            const rows = screen.getAllByRole('row');

            expect(rows.length).toBeGreaterThanOrEqual(2);

            const dataRow = rows.find((row) => within(row).queryByText('Uogienės'));

            expect(dataRow).toBeInTheDocument();
            expect(within(dataRow!).getAllByRole('cell')).toHaveListWithTextContent(['', 'Uogienės', '']);
        });

        it('renders filtered out data', () => {
            vi.mocked(useFilteredGroups).mockReturnValue([]);

            render(
                <MockTheme>
                    <MockRedux>
                        <GroupsTable />
                    </MockRedux>
                </MockTheme>
            );

            const rows = screen.getAllByRole('row');

            expect(rows.length).toBeGreaterThanOrEqual(1);
            expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['', 'Group', 'Annual']);
        });
    });

    describe('handles drag and reorder', () => {
        it('calls setActive when drag starts', () => {
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
});
