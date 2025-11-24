import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useFilteredList } from '~/client/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { DetailsGroups } from '~/client/pages/details/DetailsGroups';
import { DetailsTable } from '~/client/pages/details/DetailsTable';
import { useDetailsHasData } from '~/client/pages/details/hooks/useDetailsHasData';
import { useMissingDetails } from '~/client/pages/details/hooks/useMissingDetails';
import { useMissingOnly } from '~/client/pages/details/MissingOnlyContext';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/filters/hooks/useFilteredList', () => ({
    useFilteredList: jest.fn(),
}));
jest.mock('~/client/pages/details/hooks/useDetailsHasData', () => ({
    useDetailsHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/pages/details/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn().mockReturnValue([false, jest.fn()]),
}));
jest.mock('~/client/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/client/filters/QuickFilterContext', () => ({
    useQuickFilterContext: jest.fn(),
}));
jest.mock('~/client/filters/hooks/useGroupFilter', () => ({
    useGroupFilter: jest.fn(),
}));
jest.mock('~/client/pages/details/hooks/useMissingDetails', () => ({
    useMissingDetails: jest.fn().mockReturnValue([]),
}));
jest.mock('~/client/pages/details/MissingOnlyCheckbox', () => ({
    MissingOnlyCheckbox: jest.fn(({ onClick }: { onClick: () => void }) => <input type="checkbox" onClick={onClick} />),
}));
jest.mock('~/client/pages/details/DetailsGroups', () => ({
    DetailsGroups: jest.fn().mockReturnValue(null),
}));

describe('<DetailsTable>', () => {
    const details = getDetailsFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        details,
    };

    const setFilter = jest.fn();

    beforeEach(() => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        jest.mocked(useQuickFilterContext).mockReturnValue(['', setFilter]);
        jest.mocked(useGroupFilter).mockReturnValue('');
        jest.mocked(useFilteredList).mockReturnValue(details);
    });

    afterEach(() => jest.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();

            const row = within(screen.getByRole('row'));

            expect(row.getAllByRole('columnheader')).toHaveListWithTextContent(['', '23', '22', '21']);

            expect(DetailsGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės', 'Daržovės'],
                    details,
                },
                undefined
            );
        });

        it('renders table for complete state with data filtered-out', () => {
            jest.mocked(useFilteredList).mockReturnValue([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(DetailsGroups).toHaveBeenCalledWith({ groups: [], details: [] }, undefined);
        });

        it('renders table with group selected', () => {
            jest.mocked(useGroupFilter).mockReturnValue('Uogienės');
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(DetailsGroups).toHaveBeenCalledWith({ groups: ['Uogienės'], details: expect.any(Array) }, undefined);
        });

        it('does not render table for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            jest.mocked(useDetailsHasData).mockReturnValueOnce(false);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('loader', () => {
        it('does not render loader for complete state', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('renders loader for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            jest.mocked(useDetailsHasData).mockReturnValueOnce(false);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });

    describe('missing-only', () => {
        const setMissingOnly = jest.fn();
        const mockSetFilter = jest.fn();

        beforeEach(() => {
            jest.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
            jest.mocked(useQuickFilterContext).mockReturnValue(['', mockSetFilter]);
        });

        afterEach(() => jest.clearAllMocks());

        it('renders missing only rows if missing state is set', () => {
            jest.mocked(useMissingDetails).mockReturnValueOnce(details.slice(1, 2));
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(DetailsGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės'],
                    details: details.slice(1, 2),
                },
                undefined
            );
        });

        it('clears missing-only state if all missing rows are filtered out', () => {
            jest.mocked(useFilteredList).mockReturnValueOnce(details.slice(2));
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            expect(setMissingOnly).toHaveBeenCalledWith(false);
        });

        it('calls clearFilter on missing-only checkbox being clicked when all missing rows are filtered out', async () => {
            const testSetFilter = jest.fn();
            jest.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
            jest.mocked(useQuickFilterContext).mockReturnValue(['z', testSetFilter]);
            jest.mocked(useFilteredList).mockReturnValue(details);
            jest.mocked(useMissingDetails).mockReturnValue([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).toHaveBeenCalledWith('');
        });

        it('does not call clearFilter when missingOnly is false', async () => {
            const testSetFilter = jest.fn();
            jest.mocked(useMissingOnly).mockReturnValueOnce([false, setMissingOnly]);
            jest.mocked(useQuickFilterContext).mockReturnValueOnce(['z', testSetFilter]);
            jest.mocked(useFilteredList).mockReturnValueOnce([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).not.toHaveBeenCalled();
        });

        it('does not call clearFilter when filter is empty', async () => {
            const testSetFilter = jest.fn();
            jest.mocked(useQuickFilterContext).mockReturnValueOnce(['', testSetFilter]);
            jest.mocked(useFilteredList).mockReturnValueOnce([]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).not.toHaveBeenCalled();
        });

        it('does not call clearFilter when hasMissingDetails is true', async () => {
            const testSetFilter = jest.fn();
            jest.mocked(useQuickFilterContext).mockReturnValueOnce(['z', testSetFilter]);
            render(
                <MockTheme>
                    <MockRedux state={state}>
                        <DetailsTable />
                    </MockRedux>
                </MockTheme>
            );

            await user.click(screen.getByRole('checkbox'));

            expect(testSetFilter).not.toHaveBeenCalled();
        });
    });
});
