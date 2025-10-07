import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { LoadingState, useLockingLoader } from '~/client/app/common/hooks/useLockingLoader';
import { DetailsGroups } from '~/client/app/details/DetailsGroups';
import { DetailsTable } from '~/client/app/details/DetailsTable';
import { useDetailsHasData } from '~/client/app/details/hooks/useDetailsHasData';
import { useMissingOnly } from '~/client/app/details/MissingOnlyContext';
import { useFilteredList } from '~/client/app/filters/hooks/useFilteredList';
import { useGroupFilter } from '~/client/app/filters/hooks/useGroupFilter';
import { useQuickFilterContext } from '~/client/app/filters/QuickFilterContext';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/app/filters/hooks/useFilteredList', () => ({
    useFilteredList: jest.fn(),
}));
jest.mock('~/client/app/details/hooks/useDetailsHasData', () => ({
    useDetailsHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/app/details/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn().mockReturnValue([false, jest.fn()]),
}));
jest.mock('~/client/app/common/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/app/common/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/client/app/filters/QuickFilterContext', () => ({
    useQuickFilterContext: jest.fn().mockReturnValue(['', jest.fn()]),
}));
jest.mock('~/client/app/filters/hooks/useGroupFilter', () => ({
    useGroupFilter: jest.fn(),
}));
jest.mock('~/client/app/details/MissingOnlyCheckbox', () => ({
    MissingOnlyCheckbox: jest.fn(({ onClick }: { onClick: () => void }) => <input type="checkbox" onClick={onClick} />),
}));
jest.mock('~/client/app/details/DetailsGroups', () => ({
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
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();

            const row = within(screen.getByRole('row'));

            expect(row.getAllByRole('columnheader')).toHaveListWithTextContent(['', '', '23', '22', '21']);

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
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(DetailsGroups).toHaveBeenCalledWith({ groups: [], details: [] }, undefined);
        });

        it('renders table with group selected', () => {
            jest.mocked(useGroupFilter).mockReturnValue('Uogienės');
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(DetailsGroups).toHaveBeenCalledWith({ groups: ['Uogienės'], details: expect.any(Array) }, undefined);
        });

        it('does not render table for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            jest.mocked(useDetailsHasData).mockReturnValueOnce(false);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('loader', () => {
        it('does not render loader for complete state', () => {
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('renders loader for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            jest.mocked(useDetailsHasData).mockReturnValueOnce(false);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.INITIAL);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.LOADING);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValueOnce(LoadingState.FAILED);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });

    describe('missing-only', () => {
        const setMissingOnly = jest.fn();

        beforeEach(() => jest.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]));

        afterEach(() => jest.clearAllMocks());

        it('renders missing only rows if missing state is set', () => {
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
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
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(setMissingOnly).toHaveBeenCalledWith(false);
        });

        it('calls clearFilter on missing-only checkbox being clicked when all missing rows are filtered out', async () => {
            jest.mocked(useQuickFilterContext).mockReturnValue(['z', setFilter]);
            jest.mocked(useFilteredList).mockReturnValue([]);
            render(
                <MockRedux state={state}>
                    <DetailsTable />
                </MockRedux>
            );

            expect(setMissingOnly).not.toHaveBeenCalled();

            await userEvent.click(screen.getByRole('checkbox'));

            expect(setFilter).toHaveBeenCalledWith('');
        });
    });
});
