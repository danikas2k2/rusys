import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { GroupsTable } from '~/client/pages/groups/GroupsTable';
import { useGroups } from '~/client/state/groups/useGroups';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/common/hooks/useLockingLoader');
jest.mock('~/client/filters/hooks/useQuickFilter', () => ({
    useQuickFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/utils/getOverlapIndex');

describe('<GroupsTable>', () => {
    beforeEach(() => {
        jest.mocked(useGroups).mockReturnValue(getGroupsFixture());
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(
            <MockRedux>
                <GroupsTable />
            </MockRedux>
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');

        expect(rows).toHaveLength(3);
        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['Group', 'Annual']);
        expect(within(rows[1]).getAllByRole('cell')).toHaveListWithTextContent(['Uogienės', '']);
        expect(within(rows[2]).getAllByRole('cell')).toHaveListWithTextContent(['Daržovės', '']);
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockRedux>
                    <GroupsTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);
            render(
                <MockRedux>
                    <GroupsTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);
            render(
                <MockRedux>
                    <GroupsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            jest.mocked(useGroups).mockReturnValue([]);
            render(
                <MockRedux>
                    <GroupsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            jest.mocked(useQuickFilter).mockReturnValue('Uogienės');
            render(
                <MockRedux>
                    <GroupsTable />
                </MockRedux>
            );
            const rows = screen.getAllByRole('row');

            expect(rows).toHaveLength(2);

            const [, dataRow] = rows;

            expect(within(dataRow).getAllByRole('cell')).toHaveListWithTextContent(['Uogienės', '']);
        });

        it('renders filtered out data', () => {
            jest.mocked(useQuickFilter).mockReturnValue('h');
            render(
                <MockRedux>
                    <GroupsTable />
                </MockRedux>
            );

            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
