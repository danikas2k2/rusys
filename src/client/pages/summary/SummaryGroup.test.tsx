import { render, screen } from '@testing-library/react';
import { MockThemeUpdate } from '@tests/MockThemeUpdate';

import React from 'react';

import { Table } from '@mantine/core';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';

jest.mock('~/client/pages/summary/hooks/useSummaryYears');
jest.mock('~/client/filters/hooks/useGroupFilterPredicate');
jest.mock('~/client/filters/hooks/useQuickFilterPredicate');
jest.mock('~/client/pages/summary/SummaryRow', () => ({
    SummaryRow: ({ name, hidden }: { name: string; hidden?: boolean }) => (
        <tr data-hidden={hidden}>
            <td>{name}</td>
        </tr>
    ),
}));
jest.mock('~/client/table/GroupTitle', () => ({
    GroupTitle: ({ children, bg, hidden }: { children: string; bg: string; hidden?: boolean }) => (
        <tbody data-hidden={hidden}>
            <tr>
                <td data-bg={bg}>{children}</td>
            </tr>
        </tbody>
    ),
}));

describe('<SummaryGroup>', () => {
    beforeAll(() => {
        jest.mocked(useSummaryYears).mockReturnValue([23, 22, 21]);
        jest.mocked(useGroupFilterPredicate).mockReturnValue(() => true);
        jest.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders rows', () => {
        render(
            <MockThemeUpdate update="recycled">
                <Table>
                    <SummaryGroup group="Uogienės" summary={[{ group: 'Uogienės', name: 'Braškės', years: [] }]} />
                </Table>
            </MockThemeUpdate>
        );

        expect(screen.getAllByRole('rowgroup')).toHaveListWithTextContent(['Uogienės', 'Braškės']);
    });

    it('uses consumed update type', () => {
        render(
            <MockThemeUpdate update="consumed">
                <Table>
                    <SummaryGroup group="Daržovės" summary={[{ group: 'Daržovės', name: 'Burokai', years: [] }]} />
                </Table>
            </MockThemeUpdate>
        );

        expect(screen.getAllByRole('rowgroup')).toHaveListWithTextContent(['Daržovės', 'Burokai']);
    });

    it('renders empty tbody when no summary items', () => {
        render(
            <MockThemeUpdate update="recycled">
                <Table>
                    <SummaryGroup group="Uogienės" summary={[]} />
                </Table>
            </MockThemeUpdate>
        );

        expect(screen.getAllByRole('rowgroup')).toHaveLength(2).toHaveListWithTextContent(['Uogienės', '']);
    });

    it('marks group and rows as hidden when filters hide them', () => {
        // Mock filters to hide the group/name
        jest.mocked(useGroupFilterPredicate).mockReturnValue(() => false);
        jest.mocked(useQuickFilterPredicate).mockReturnValue(() => false);

        render(
            <MockThemeUpdate update="recycled">
                <Table>
                    <SummaryGroup group="Uogienės" summary={[{ group: 'Uogienės', name: 'Braškės', years: [] }]} />
                </Table>
            </MockThemeUpdate>
        );

        expect(screen.getAllByRole('rowgroup')[0]).toHaveAttribute('data-hidden', 'true');
        expect(screen.getAllByRole('row')[1]).toHaveTextContent('Braškės').toHaveAttribute('data-hidden', 'true');
    });
});
