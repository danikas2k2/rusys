import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DetailsTable } from '~/client/details/DetailsTable';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { useDetails } from '~/state/details/useDetails';
import { useHasMissing } from '~/state/details/useHasMissing';
import { useFilter } from '~/state/filter/useFilter';
import { useYears } from '~/state/years/useYears';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');
jest.mock('~/state/details/useDetails');
jest.mock('~/state/details/useHasMissing', () => ({
    useHasMissing: jest.fn().mockReturnValue(false),
}));
jest.mock('~/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));

describe('DetailsTable', () => {
    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(<DetailsTable />, withReduxState());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(7);

        expect(within(rows[0]).getByRole('checkbox')).toBeChecked();
        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['', '', '23', '22', '21']);

        expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('G');

        expect(within(rows[2]).getByRole('checkbox')).toBeChecked();
        expect(within(rows[2]).getAllByRole('cell')).toHaveListWithTextContent(['', 'A', '.', '1d', '.']);

        expect(within(rows[3]).getByRole('checkbox')).toBeChecked();
        expect(within(rows[3]).getAllByRole('cell')).toHaveListWithTextContent(['', 'C', '.', '.', '2p']);

        expect(within(rows[4]).getByRole('rowheader')).toHaveTextContent('J');

        expect(within(rows[5]).getByRole('checkbox')).toBeChecked();
        expect(within(rows[5]).getAllByRole('cell')).toHaveListWithTextContent(['', 'A', '.', '.', '2p']);

        expect(within(rows[6]).getByRole('checkbox')).not.toBeChecked();
        expect(within(rows[6]).getAllByRole('cell')).toHaveListWithTextContent(['', 'B', '.', '1p', '.']);
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
            (useDetails as jest.Mock).mockReturnValueOnce([]);
            render(<DetailsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            (useFilter as jest.Mock).mockReturnValueOnce('a');
            render(<DetailsTable />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(5);
            const [, groupRow, dataRow] = rows;
            expect(within(groupRow).getByRole('rowheader')).toHaveTextContent('G');
            expect(within(dataRow).getAllByRole('cell')[1]).toHaveTextContent('A');
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
            // missing.mockImplementation((group, name) => group === 'Group' && name === 'First');
        });

        it('renders with missing rows', () => {
            render(<DetailsTable />, withReduxState());

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(5);
            expect(checkboxes[0]).toBeChecked();
            expect(checkboxes[1]).toBeChecked();
            expect(checkboxes[2]).toBeChecked();
            expect(checkboxes[3]).toBeChecked();
            expect(checkboxes[4]).not.toBeChecked();
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
            expect(checkboxes).toHaveLength(5);
            expect(checkboxes[0]).toBeChecked();
            expect(checkboxes[1]).toBeChecked();
            expect(checkboxes[2]).toBeChecked();
            expect(checkboxes[3]).toBeChecked();
            expect(checkboxes[4]).not.toBeChecked();
        });
    });
});
