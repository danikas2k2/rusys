import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DetailsTable from '~/client/details/DetailsTable';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { useDetails } from '~/state/details/useDetails';
import { useFilter } from '~/state/filter/useFilter';
import { useHasMissing } from '~/state/missing/useHasMissing';
import { useIsMissing } from '~/state/missing/useIsMissing';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/years/useYears', () => ({
    useYears: jest.fn().mockReturnValue([21, 22, 23]),
}));
jest.mock('~/state/details/useDetails', () => ({
    useDetails: jest.fn().mockReturnValue({
        Group: {
            First: {
                20: { '': 1 },
                21: { '': 2 },
            },
            Second: {
                21: { d: 1 },
                23: { m: 2 },
            },
        },
    }),
}));
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/state/missing/useHasMissing', () => ({
    useHasMissing: jest.fn().mockReturnValue(false),
}));
jest.mock('~/state/missing/useIsMissing', () => ({
    useIsMissing: jest.fn(),
}));

describe('DetailsTable', () => {
    const missing = jest.fn();

    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        (useIsMissing as jest.Mock).mockReturnValue(missing);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(<DetailsTable />, withReduxState());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(4);
        const [headRow, groupRow, firstRow, secondRow] = rows;

        expect(within(headRow).getByRole('checkbox')).toBeChecked();
        const headCells = within(headRow).getAllByRole('columnheader');
        expect(headCells).toHaveLength(5);
        [/* blank for checkbox: */ '', /* blank for names: */ '', /* years: */ '21', '22', '23'].forEach((text, i) =>
            expect(headCells[i]).toHaveTextContent(text)
        );

        expect(within(groupRow).getByRole('rowheader')).toHaveTextContent('Group');

        expect(within(firstRow).getByRole('checkbox')).toBeChecked();
        const firstRowCells = within(firstRow).getAllByRole('cell');
        expect(firstRowCells).toHaveLength(5);
        [/* blank for checkbox: */ '', 'First', /* values for each year: */ '2', '.', '.'].forEach((text, i) =>
            expect(firstRowCells[i]).toHaveTextContent(text)
        );

        expect(within(secondRow).getByRole('checkbox')).toBeChecked();
        const secondRowCells = within(secondRow).getAllByRole('cell');
        expect(secondRowCells).toHaveLength(5);
        [/* blank for checkbox: */ '', 'Second', /* values for each year: */ '1d', '.', '2m'].forEach((text, i) =>
            expect(secondRowCells[i]).toHaveTextContent(text)
        );
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<DetailsTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<DetailsTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.FAILED);
            render(<DetailsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without years', () => {
            (useYears as jest.Mock).mockReturnValueOnce([]);
            render(<DetailsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without details', () => {
            (useDetails as jest.Mock).mockReturnValueOnce({});
            render(<DetailsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('sec');
            render(<DetailsTable />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(3);
            const [, groupRow, dataRow] = rows;
            expect(within(groupRow).getByRole('rowheader')).toHaveTextContent('Group');
            expect(within(dataRow).getAllByRole('cell')[1]).toHaveTextContent('Second');
        });

        it('renders filtered out data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('third');
            render(<DetailsTable />, withReduxState());
            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });

    describe('handles missing state', () => {
        beforeAll(() => {
            (useHasMissing as jest.Mock).mockReturnValue(true);
            missing.mockImplementation((group, name) => group === 'Group' && name === 'First');
        });

        it('renders with missing rows', () => {
            render(<DetailsTable />, withReduxState());

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(3);
            expect(checkboxes[0]).toBeChecked();
            expect(checkboxes[1]).not.toBeChecked();
            expect(checkboxes[2]).toBeChecked();
        });

        it('renders missing rows only when header checkbox is unchecked', async () => {
            render(<DetailsTable />, withReduxState());

            await userEvent.click(screen.getAllByRole('checkbox')[0]);

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(2);
            expect(checkboxes[0]).not.toBeChecked();
            expect(checkboxes[1]).not.toBeChecked();
        });

        it('renders with missing rows again when header checkbox is checked back', async () => {
            render(<DetailsTable />, withReduxState());

            await userEvent.click(screen.getAllByRole('checkbox')[0]);
            await userEvent.click(screen.getAllByRole('checkbox')[0]);

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(3);
            expect(checkboxes[0]).toBeChecked();
            expect(checkboxes[1]).not.toBeChecked();
            expect(checkboxes[2]).toBeChecked();
        });

        it('renders all rows when header checkbox is unchecked but no missing rows returned', async () => {
            render(<DetailsTable />, withReduxState());

            (useHasMissing as jest.Mock).mockReturnValue(false);
            missing.mockReturnValue(false);

            await userEvent.click(screen.getAllByRole('checkbox')[0]);

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(3);
            expect(checkboxes[0]).toBeChecked();
            expect(checkboxes[1]).toBeChecked();
            expect(checkboxes[2]).toBeChecked();
        });
    });
});
