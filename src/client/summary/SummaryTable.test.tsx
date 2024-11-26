import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { useSummaryHasData } from '~/client/summary/hooks/useSummaryHasData';
import { SummaryGroups } from '~/client/summary/SummaryGroups';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { useGroup } from '~/state/group/useGroup';
import { getGroupsFixture, getSummaryFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');
jest.mock('~/client/common/hooks/useFilteredList', () => ({
    useFilteredList: jest.fn(),
}));
jest.mock('~/client/summary/hooks/useSummaryHasData', () => ({
    useSummaryHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/common/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/common/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/state/group/useGroup', () => ({
    useGroup: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/summary/SummaryGroups', () => ({
    SummaryGroups: jest.fn().mockReturnValue(null),
}));

describe('SummaryTable', () => {
    const summary = getSummaryFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        summary,
    };

    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        (useFilteredList as jest.Mock).mockReturnValue(summary);
    });

    afterEach(() => jest.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('table')).toBeInTheDocument();

            const row = within(screen.getByRole('row'));
            expect(row.getAllByRole('columnheader')).toHaveListWithTextContent(['', '23/24', '22/23', '21/22']);

            expect(SummaryGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės', 'Daržovės'],
                    summary,
                },
                {}
            );
        });

        it('renders table for complete state with data filtered-out', () => {
            (useFilteredList as jest.Mock).mockReturnValueOnce([]);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroups).toHaveBeenCalledWith({ groups: [], summary: [] }, {});
        });

        it('renders table with group selected', () => {
            (useGroup as jest.Mock).mockReturnValueOnce('Uogienės');
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroups).toHaveBeenCalledWith({ groups: ['Uogienės'], summary: expect.any(Array) }, {});
        });

        it('does not render table for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            (useSummaryHasData as jest.Mock).mockReturnValueOnce(false);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('loader', () => {
        it('does not render loader for complete state', () => {
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('renders loader for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.FAILED);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            (useSummaryHasData as jest.Mock).mockReturnValueOnce(false);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.FAILED);
            render(<SummaryTable />, withReduxState(state));
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });
});
