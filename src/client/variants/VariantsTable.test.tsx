import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { VariantsTable } from '~/client/variants/VariantsTable';
import { useFilter } from '~/state/filter/useFilter';
import { useGroups } from '~/state/groups/useGroups';
import { useVariants } from '~/state/variants/useVariants';
import { getGroupsFixture, getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/years/useYears');
jest.mock('~/state/groups/useGroups');
jest.mock('~/state/variants/useVariants');
jest.mock('~/state/variants/useGroupVariants');
jest.mock('~/client/common/hooks/useLockingLoader');
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/utils/getOverlapIndex');

describe('VariantsTable', () => {
    beforeEach(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        (useVariants as jest.Mock).mockReturnValue(getVariantsFixture());
        (useGroups as jest.Mock).mockReturnValue(getGroupsFixture());
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(<VariantsTable />, withReduxState());
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rows = screen.getAllByRole('row');
        expect(rows).toHaveLength(13);
        expect(within(rows[0]).getAllByRole('columnheader')).toHaveListWithTextContent(['Variant', 'Long', 'Short']);

        expect(within(rows[1]).getAllByRole('rowheader')).toHaveListWithTextContent(['Daržovės']);
        expect(within(rows[2]).getAllByRole('cell')).toHaveListWithTextContent(['d', '3 l.', '']);
        expect(within(rows[3]).getAllByRole('cell')).toHaveListWithTextContent(['p', '2 l.', '']);
        expect(within(rows[4]).getAllByRole('cell')).toHaveListWithTextContent(['m', '1.5 l.', '']);
        expect(within(rows[5]).getAllByRole('cell')).toHaveListWithTextContent(['1', '1 l.', '']);
        expect(within(rows[6]).getAllByRole('cell')).toHaveListWithTextContent(['x', '', 'B.']);

        expect(within(rows[7]).getAllByRole('rowheader')).toHaveListWithTextContent(['Uogienės']);
        expect(within(rows[8]).getAllByRole('cell')).toHaveListWithTextContent(['p', '500 ml.', '']);
        expect(within(rows[9]).getAllByRole('cell')).toHaveListWithTextContent(['d', '750 ml.', 'D.']);
        expect(within(rows[10]).getAllByRole('cell')).toHaveListWithTextContent(['m', '250 ml.', 'M.']);
        expect(within(rows[11]).getAllByRole('cell')).toHaveListWithTextContent(['e', '', 'E.']);
        expect(within(rows[12]).getAllByRole('cell')).toHaveListWithTextContent(['x', '', 'B.']);
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.INITIAL);
            render(<VariantsTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.LOADING);
            render(<VariantsTable />, withReduxState());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.FAILED);
            render(<VariantsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without variants', () => {
            (useVariants as jest.Mock).mockReturnValue([]);
            render(<VariantsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            (useGroups as jest.Mock).mockReturnValue([]);
            render(<VariantsTable />, withReduxState());
            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            (useFilter as jest.Mock).mockReturnValue('e');
            render(<VariantsTable />, withReduxState());
            const rows = screen.getAllByRole('row');
            expect(rows).toHaveLength(3);
            const [, headerRow, dataRow] = rows;
            expect(within(headerRow).getByRole('rowheader')).toHaveTextContent('Uogienės');
            expect(within(dataRow).getAllByRole('cell')).toHaveListWithTextContent(['e', '', 'E.']);
        });

        it('renders filtered out data', () => {
            (useFilter as jest.Mock).mockReturnValue('h');
            render(<VariantsTable />, withReduxState());
            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
