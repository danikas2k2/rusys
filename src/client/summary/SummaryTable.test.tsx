import { render, screen, within } from '@testing-library/react';
import React from 'react';
import SummaryTable from '~/client/summary/SummaryTable';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { useFilter } from '~/state/filter/useFilter';
import { useIsMissing } from '~/state/missing/useIsMissing';
import { useSummary } from '~/state/summary/useSummary';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/years/useYears', () => ({
    useYears: jest.fn().mockReturnValue([21, 22, 23]),
}));
jest.mock('~/state/summary/useSummary', () => ({
    useSummary: jest.fn().mockReturnValue({
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

describe('SummaryTable', () => {
    const missing = jest.fn();

    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        (useIsMissing as jest.Mock).mockReturnValue(missing);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(<SummaryTable />, withReduxState());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(4);
        const [headRow, groupRow, firstRow, secondRow] = rows;

        const headCells = within(headRow).getAllByRole('columnheader');
        expect(headCells).toHaveLength(4);
        [/* blank for names: */ '', /* years: */ '21', '22', '23'].forEach((text, i) =>
            expect(headCells[i]).toHaveTextContent(text)
        );

        expect(within(groupRow).getByRole('rowheader')).toHaveTextContent('Group');

        const firstRowCells = within(firstRow).getAllByRole('cell');
        expect(firstRowCells).toHaveLength(4);
        ['First', /* values for each year: */ '2', '', ''].forEach((text, i) =>
            expect(firstRowCells[i]).toHaveTextContent(text)
        );

        const secondRowCells = within(secondRow).getAllByRole('cell');
        expect(secondRowCells).toHaveLength(4);
        ['Second', /* values for each year: */ '1d', '', '2m'].forEach((text, i) =>
            expect(secondRowCells[i]).toHaveTextContent(text)
        );
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
            render(<SummaryTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
            render(<SummaryTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.FAILED);
            render(<SummaryTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without years', () => {
            (useYears as jest.Mock).mockReturnValueOnce([]);
            render(<SummaryTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without summary', () => {
            (useSummary as jest.Mock).mockReturnValueOnce({});
            render(<SummaryTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('sec');
            render(<SummaryTable />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(3);
            const [, groupRow, dataRow] = rows;
            expect(within(groupRow).getByRole('rowheader')).toHaveTextContent('Group');
            expect(within(dataRow).getAllByRole('cell')[0]).toHaveTextContent('Second');
        });

        it('renders filtered out data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('third');
            render(<SummaryTable />, withReduxState());
            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
