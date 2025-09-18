import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getSummaryFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { useSummaryHasData } from '~/client/summary/hooks/useSummaryHasData';
import { SummaryGroups } from '~/client/summary/SummaryGroups';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { useGroup } from '~/state/group/useGroup';

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

describe('<SummaryTable>', () => {
    const summary = getSummaryFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        summary,
    };

    beforeAll(() => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        jest.mocked(useFilteredList).mockReturnValue(summary);
    });

    afterEach(() => jest.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();

            const row = within(screen.getByRole('row'));

            expect(row.getAllByRole('columnheader')).toHaveListWithTextContent(['', '23/24', '22/23', '21/22']);

            expect(SummaryGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės', 'Daržovės'],
                    summary,
                },
                undefined
            );
        });

        it('renders table for complete state with data filtered-out', () => {
            jest.mocked(useFilteredList).mockReturnValueOnce([]);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroups).toHaveBeenCalledWith({ groups: [], summary: [] }, undefined);
        });

        it('renders table with group selected', () => {
            jest.mocked(useGroup).mockReturnValueOnce('Uogienės');
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroups).toHaveBeenCalledWith({ groups: ['Uogienės'], summary: expect.any(Array) }, undefined);
        });

        it('does not render table for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            jest.mocked(useSummaryHasData).mockReturnValueOnce(false);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('loader', () => {
        it('does not render loader for complete state', () => {
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('renders loader for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            jest.mocked(useSummaryHasData).mockReturnValueOnce(false);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockRedux state={state}>
                    <SummaryTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });
});
