import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { useFilter } from '~/state/filter/useFilter';
import { useSummary } from '~/state/summary/useSummary';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');
jest.mock('~/state/summary/useSummary');
jest.mock('~/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));

describe('SummaryTable', () => {
    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(<SummaryTable />, withReduxState());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(7);
        const [headRow, groupRow, firstRow, secondRow] = rows;

        const headCells = within(headRow).getAllByRole('columnheader');
        expect(headCells).toHaveLength(4);
        [/* blank for names: */ '', /* years: */ '23/24', '22/23', '21/22'].forEach((text, i) =>
            expect(headCells[i]).toHaveTextContent(text)
        );

        expect(within(groupRow).getByRole('rowheader')).toHaveTextContent('Jams');

        const firstRowCells = within(firstRow).getAllByRole('cell');
        expect(firstRowCells).toHaveLength(4);
        ['A', /* values for each year: */ '', '', '2'].forEach((text, i) =>
            expect(firstRowCells[i]).toHaveTextContent(text)
        );

        const secondRowCells = within(secondRow).getAllByRole('cell');
        expect(secondRowCells).toHaveLength(4);
        ['B', /* values for each year: */ '', '1d', ''].forEach((text, i) =>
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
            (useSummary as jest.Mock).mockReturnValueOnce([]);
            render(<SummaryTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('a');
            render(<SummaryTable />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(5);
            expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Jams');
            expect(within(rows[2]).getAllByRole('cell')[0]).toHaveTextContent('A');
            expect(within(rows[3]).getByRole('rowheader')).toHaveTextContent('G');
            expect(within(rows[4]).getAllByRole('cell')[0]).toHaveTextContent('A');
        });

        it('renders filtered out data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('z');
            render(<SummaryTable />, withReduxState());
            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
