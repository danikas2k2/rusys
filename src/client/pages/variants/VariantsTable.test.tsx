import { render, screen, within } from '@testing-library/react';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { VariantsTable } from '~/client/pages/variants/VariantsTable';
import { useGroups } from '~/client/state/groups/useGroups';
import { useVariants } from '~/client/state/variants/useVariants';

jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/groups/useGroups');
jest.mock('~/client/state/variants/useVariants');
jest.mock('~/client/state/variants/useGroupVariants');
jest.mock('~/client/common/hooks/useLockingLoader');
jest.mock('~/client/filters/hooks/useQuickFilter', () => ({
    useQuickFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/utils/getOverlapIndex');

describe('<VariantsTable>', () => {
    beforeEach(() => {
        jest.mocked(useLockingLoader).mockReturnValue(LoadingState.COMPLETE);
        jest.mocked(useVariants).mockReturnValue(getVariantsFixture());
        jest.mocked(useGroups).mockReturnValue(getGroupsFixture());
    });

    afterEach(() => jest.clearAllMocks());

    it('renders table structure', () => {
        render(
            <MockRedux>
                <VariantsTable />
            </MockRedux>
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();

        const rowData = {
            Daržovės: [
                ['d', ''],
                ['p', ''],
                ['m', ''],
                ['1', ''],
                ['x', 'B.'],
            ],
            Uogienės: [
                ['p', ''],
                ['d', 'D.'],
                ['m', 'M.'],
                ['e', 'E.'],
                ['x', 'B.'],
            ],
        };

        const rows = screen.getAllByRole('row');
        let count = 0;

        expect(within(rows[count++]).getAllByRole('columnheader')).toHaveListWithTextContent(['Variant', 'Suffix']);

        for (const [group, cells] of Object.entries(rowData)) {
            expect(within(rows[count++]).getAllByRole('rowheader')).toHaveListWithTextContent([group]);

            for (const cell of cells) {
                expect(within(rows[count++]).getAllByRole('cell')).toHaveListWithTextContent(cell);
            }
        }

        expect(rows).toHaveLength(count);
    });

    describe('renders loader', () => {
        it('renders loader for initial state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.INITIAL);
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders loader for loading state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.LOADING);
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('renders error', () => {
        it('renders error for failed state', () => {
            jest.mocked(useLockingLoader).mockReturnValue(LoadingState.FAILED);
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without variants', () => {
            jest.mocked(useVariants).mockReturnValue([]);
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });

        it('renders error for complete state without groups', () => {
            jest.mocked(useGroups).mockReturnValue([]);
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No data');
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
    });

    describe('handles filter state', () => {
        it('renders filtered data', () => {
            jest.mocked(useQuickFilter).mockReturnValue('e');
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );
            const rows = screen.getAllByRole('row');

            expect(rows).toHaveLength(3);

            const [, headerRow, dataRow] = rows;

            expect(within(headerRow).getByRole('rowheader')).toHaveTextContent('Uogienės');
            expect(within(dataRow).getAllByRole('cell')).toHaveListWithTextContent(['e', 'E.']);
        });

        it('renders filtered out data', () => {
            jest.mocked(useQuickFilter).mockReturnValue('h');
            render(
                <MockRedux>
                    <VariantsTable />
                </MockRedux>
            );

            expect(screen.getAllByRole('row')).toHaveLength(1);
        });
    });
});
