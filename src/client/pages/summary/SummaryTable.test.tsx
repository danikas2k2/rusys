import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getSummaryFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';

vi.mock('~/client/state/years/useYears');
vi.mock('~/client/filters/hooks/useFilteredList', async () => ({
    useFilteredList: vi.fn(),
}));
vi.mock('~/client/pages/summary/hooks/useSummaryHasData', async () => ({
    useSummaryHasData: vi.fn().mockReturnValue(true),
}));
vi.mock('~/client/hooks/useLockingLoader', async () => ({
    ...(await vi.importActual('~/client/hooks/useLockingLoader')),
    useLockingLoader: vi.fn(),
}));
vi.mock('~/client/filters/hooks/useQuickFilter', async () => ({
    useQuickFilter: vi.fn().mockReturnValue(''),
}));
vi.mock('~/client/filters/hooks/useGroupFilter', async () => ({
    useGroupFilter: vi.fn(),
}));
vi.mock('~/client/pages/summary/SummaryGroup', async () => ({
    SummaryGroup: vi.fn().mockReturnValue(null),
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
        vi.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        vi.mocked(useFilteredList).mockReturnValue(summary);
        vi.mocked(useGroupFilter).mockReturnValue('');
    });

    afterEach(() => vi.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();

            const row = within(screen.getByRole('row'));

            expect(row.getAllByRole('columnheader')).toHaveListWithTextContent(['', '23/24', '22/23', '21/22']);

            expect(SummaryGroup).toHaveBeenCalledTimes(2);
        });

        it('renders table for complete state with data filtered-out', () => {
            vi.mocked(useFilteredList).mockReturnValueOnce([]);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroup).not.toHaveBeenCalled();
        });

        it('renders table with group selected', () => {
            vi.mocked(useGroupFilter).mockReturnValue('Uogienės');
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroup).toHaveBeenCalledTimes(1);
        });

        it('does not render table for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            vi.mocked(useSummaryHasData).mockReturnValueOnce(false);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('loader', () => {
        it('does not render loader for complete state', () => {
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('renders loader for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            vi.mocked(useSummaryHasData).mockReturnValueOnce(false);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            vi.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });
});
