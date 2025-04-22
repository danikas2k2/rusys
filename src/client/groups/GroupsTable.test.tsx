import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { GroupsTable } from '~/client/groups/GroupsTable';
import { useFilter } from '~/state/filter/useFilter';
import { useGroups } from '~/state/groups/useGroups';

jest.mock('~/state/years/useYears');
jest.mock('~/state/groups/useGroups');
jest.mock('~/client/common/hooks/useLockingLoader');
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/utils/getOverlapIndex');

describe('<GroupsTable>', () => {
    beforeEach(() => {
        jest.mocked(useGroups).mockReturnValue(getGroupsFixture());
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
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
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(<GroupsTable />, withReduxState());

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);
            render(<GroupsTable />, withReduxState());

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);
            render(<GroupsTable />, withReduxState());

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            jest.mocked(useGroups).mockReturnValue([]);
            render(<GroupsTable />, withReduxState());

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            jest.mocked(useFilter).mockReturnValue('g');
            render(<GroupsTable />, withReduxState());
            const rows = screen.getAllByRole('row');

            expect(rows).toHaveLength(2);

            const [, dataRow] = rows;

            expect(within(dataRow).getByRole('cell')).toHaveTextContent('Uogienės');
        });

        it('renders filtered out data', () => {
            jest.mocked(useFilter).mockReturnValue('h');
            render(<GroupsTable />, withReduxState());

            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
