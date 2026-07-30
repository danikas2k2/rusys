import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getSummaryFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useSummaryHasData } from '~/client/pages/summary/hooks/useSummaryHasData';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import { SummaryTable } from '~/client/pages/summary/SummaryTable';
import { useSummary } from '~/client/state/summary/useSummary';

vi.mock(import('~/client/state/years/useYears'));
vi.mock(import('~/client/filters/GroupFilterContext'), () => ({
    useGroupFilter: vi.fn(),
}));
vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'), () => ({
    useQuickFilterPredicate: vi.fn(),
}));
vi.mock(import('~/client/pages/summary/hooks/useSummaryHasData'), () => ({
    useSummaryHasData: vi.fn().mockReturnValue(true),
}));
vi.mock(import('~/client/state/summary/useSummary'), () => ({
    useSummary: vi.fn(),
}));
vi.mock(import('~/client/hooks/useLockingLoader'), async () => ({
    ...(await vi.importActual('~/client/hooks/useLockingLoader')),
    useLockingLoader: vi.fn(),
}));
vi.mock(import('~/client/pages/summary/SummaryRow'), () => ({
    SummaryRow: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/common/AmountViewToggle'), () => ({
    AmountViewToggle: vi.fn().mockReturnValue(null),
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
        vi.mocked(useSummary).mockReturnValue(summary);
        vi.mocked(useGroupFilter).mockReturnValue(['Uogienės', vi.fn()]);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
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

            const [row] = screen.getAllByRole('row');

            expect(within(row).getAllByRole('columnheader')).toHaveListWithTextContent(['', '23/24', '22/23', '21/22']);

            // Only rows for the selected group ('Uogienės': Avietės, Braškės) are rendered
            expect(SummaryRow).toHaveBeenCalledTimes(2);
        });

        it('renders only the rows for the selected group', () => {
            vi.mocked(useGroupFilter).mockReturnValueOnce(['Daržovės', vi.fn()]);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryRow).toHaveBeenCalledTimes(2);
            expect(SummaryRow).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ group: 'Daržovės', name: 'Agurkai' }),
                undefined
            );
            expect(SummaryRow).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ group: 'Daržovės', name: 'Kopūstai' }),
                undefined
            );
        });

        it('renders no rows when the selected group has no summary data', () => {
            vi.mocked(useGroupFilter).mockReturnValueOnce(['Šaldyti', vi.fn()]);
            render(
                <MockApp state={state}>
                    <SummaryTable />
                </MockApp>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(SummaryRow).not.toHaveBeenCalled();
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
