import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getSummaryFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useRecycledSummary } from '~/client/pages/summary/hooks/useRecycledSummary';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/filters/hooks/useGroupFilterPredicate', () => ({
    useGroupFilterPredicate: jest.fn(),
}));
jest.mock('~/client/filters/hooks/useQuickFilterPredicate', () => ({
    useQuickFilterPredicate: jest.fn(),
}));
jest.mock('~/client/pages/summary/hooks/useSummaryHasData', () => ({
    useSummaryHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/pages/summary/hooks/useRecycledSummary', () => ({
    useRecycledSummary: jest.fn(),
}));
jest.mock('~/client/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/client/pages/summary/SummaryGroup', () => ({
    SummaryGroup: jest.fn().mockReturnValue(null),
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
        jest.mocked(useRecycledSummary).mockReturnValue(summary);
        jest.mocked(useGroupFilterPredicate).mockReturnValue(() => true);
        jest.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => jest.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();

            const [row] = screen.getAllByRole('row');

            expect(within(row).getAllByRole('columnheader')).toHaveListWithTextContent(['', '23/24', '22/23', '21/22']);

            expect(SummaryGroup).toHaveBeenCalledTimes(2);
        });

        it('renders table for complete state with data filtered-out', () => {
            jest.mocked(useRecycledSummary).mockReturnValueOnce([]);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            // SummaryGroup is still rendered for all groups, even with empty summary
            expect(SummaryGroup).toHaveBeenCalled();
        });

        it('renders table with group selected', () => {
            jest.mocked(useGroupFilterPredicate).mockReturnValueOnce((g: string) => g === 'Uogienės');
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryGroup).toHaveBeenCalledTimes(2);
        });

        it('does not render table for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            jest.mocked(useSummaryHasData).mockReturnValueOnce(false);
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
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
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
            jest.mocked(useSummaryHasData).mockReturnValueOnce(false);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });
});
