import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { GroupsTable } from '~/client/groups/GroupsTable';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { useFilter } from '~/state/filter/useFilter';
import { useGroups } from '~/state/groups/useGroups';
import { getGroupsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');
jest.mock('~/state/groups/useGroups');
jest.mock('~/client/common/hooks/useLockingLoader');
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/utils/getOverlapIndex');

describe('GroupsTable', () => {
    beforeEach(() => {
        (useGroups as jest.Mock).mockReturnValue(getGroupsFixture());
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(<GroupsTable />, withReduxState());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(3);
        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['Group']);
        expect(within(rows[1]).getAllByRole('cell')).toHaveListWithTextContent(['Uogienės']);
        expect(within(rows[2]).getAllByRole('cell')).toHaveListWithTextContent(['Daržovės']);
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.INITIAL);
            render(<GroupsTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.LOADING);
            render(<GroupsTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.FAILED);
            render(<GroupsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            (useGroups as jest.Mock).mockReturnValue([]);
            render(<GroupsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            (useFilter as jest.Mock).mockReturnValue('g');
            render(<GroupsTable />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(2);
            const [, dataRow] = rows;
            expect(within(dataRow).getByRole('cell')).toHaveTextContent('Uogienės');
        });

        it('renders filtered out data', () => {
            (useFilter as jest.Mock).mockReturnValue('h');
            render(<GroupsTable />, withReduxState());
            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
