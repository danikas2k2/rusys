import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { DetailsGroups } from '~/client/details/DetailsGroups';
import { DetailsTable } from '~/client/details/DetailsTable';
import { useDetailsHasData } from '~/client/details/hooks/useDetailsHasData';
import { useMissingOnly } from '~/client/details/MissingOnlyContext';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');
jest.mock('~/client/common/hooks/useFilteredList', () => ({
    useFilteredList: jest.fn(),
}));
jest.mock('~/client/details/hooks/useDetailsHasData', () => ({
    useDetailsHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/details/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn().mockReturnValue([false, jest.fn()]),
}));
jest.mock('~/client/common/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/common/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/state/filter/useClearFilter', () => ({
    useClearFilter: jest.fn(),
}));
jest.mock('~/state/group/useGroup', () => ({
    useGroup: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/details/MissingOnlyCheckbox', () => ({
    MissingOnlyCheckbox: jest.fn(({ onClick }: { onClick: () => void }) => <input type="checkbox" onClick={onClick} />),
}));
jest.mock('~/client/details/DetailsGroups', () => ({
    DetailsGroups: jest.fn().mockReturnValue(null),
}));

describe('DetailsTable', () => {
    const details = getDetailsFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        details,
    };

    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        (useFilteredList as jest.Mock).mockReturnValue(details);
    });

    afterEach(() => jest.clearAllMocks());

    describe('table', () => {
        it('renders table for complete state with data', () => {
            render(<DetailsTable />, withReduxState(state));
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
            (useFilteredList as jest.Mock).mockReturnValueOnce([]);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(DetailsGroups).toHaveBeenCalledWith({ groups: [], details: [] }, undefined);
        });

        it('renders table with group selected', () => {
            (useGroup as jest.Mock).mockReturnValueOnce('Uogienės');
            render(<DetailsTable />, withReduxState(state));
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(DetailsGroups).toHaveBeenCalledWith({ groups: ['Uogienės'], details: expect.any(Array) }, undefined);
        });

        it('does not render table for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('does not render table for complete state without data', () => {
            (useDetailsHasData as jest.Mock).mockReturnValueOnce(false);
            render(<DetailsTable />, withReduxState(state));
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
            render(<DetailsTable />, withReduxState(state));
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render loader for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.FAILED);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('error', () => {
        it('does not render error for complete state with data', () => {
            render(<DetailsTable />, withReduxState(state));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for complete state without data', () => {
            (useDetailsHasData as jest.Mock).mockReturnValueOnce(false);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
        });

        it('does not render error for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('does not render error for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders error for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.FAILED);
            render(<DetailsTable />, withReduxState(state));
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
        });
    });

    describe('missing-only', () => {
        const setMissingOnly = jest.fn();

        beforeEach(() => {
            (useMissingOnly as jest.Mock).mockReturnValueOnce([true, setMissingOnly]);
        });

        afterEach(() => jest.clearAllMocks());

        it('renders missing only rows if missing state is set', () => {
            render(<DetailsTable />, withReduxState(state));
            expect(DetailsGroups).toHaveBeenCalledWith(
                {
                    groups: ['Uogienės'],
                    details: details.slice(1, 2),
                },
                undefined
            );
        });

        it('clears missing-only state if all missing rows are filtered out', () => {
            (useFilteredList as jest.Mock).mockReturnValueOnce(details.slice(2));
            render(<DetailsTable />, withReduxState(state));
            expect(setMissingOnly).toHaveBeenCalledWith(false);
        });

        it('calls clearFilter on missing-only checkbox being clicked when all missing rows are filtered out', async () => {
            const clearFilter = jest.fn();
            (useFilter as jest.Mock).mockReturnValueOnce('z');
            (useClearFilter as jest.Mock).mockReturnValueOnce(clearFilter);
            (useFilteredList as jest.Mock).mockReturnValueOnce([]);
            render(<DetailsTable />, withReduxState(state));
            expect(setMissingOnly).not.toHaveBeenCalled();
            await userEvent.click(screen.getByRole('checkbox'));
            expect(clearFilter).toHaveBeenCalled();
        });
    });
});
