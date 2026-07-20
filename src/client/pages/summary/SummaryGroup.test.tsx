import { render, screen } from '@testing-library/react';
import { MockThemeUpdate } from '@tests/MockThemeUpdate';

import { Table } from '@mantine/core';
import React from 'react';

import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';

vi.mock(import('~/client/pages/summary/hooks/useSummaryYears'));
vi.mock(import('~/client/filters/hooks/useGroupFilterPredicate'));
vi.mock(import('~/client/filters/hooks/useQuickFilterPredicate'));
vi.mock(import('~/client/pages/summary/SummaryRow'), (): any => ({
    SummaryRow: ({ name, hidden }: { name: string; hidden?: boolean }) => (
        <tr data-hidden={hidden}>
            <td>{name}</td>
        </tr>
    ),
}));
vi.mock(import('~/client/table/GroupTitle'), (): any => ({
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
        vi.mocked(useSummaryYears).mockReturnValue([23, 22, 21]);
        vi.mocked(useGroupFilterPredicate).mockReturnValue(() => true);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => true);
    });

    afterEach(() => vi.clearAllMocks());

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

        const rowgroups = screen.getAllByRole('rowgroup');

        expect(rowgroups).toHaveLength(2);
        expect(rowgroups).toHaveListWithTextContent(['Uogienės', '']);
    });

    it('marks group and rows as hidden when filters hide them', () => {
        // Mock filters to hide the group/name
        vi.mocked(useGroupFilterPredicate).mockReturnValue(() => false);
        vi.mocked(useQuickFilterPredicate).mockReturnValue(() => false);

        render(
            <MockThemeUpdate update="recycled">
                <Table>
                    <SummaryGroup group="Uogienės" summary={[{ group: 'Uogienės', name: 'Braškės', years: [] }]} />
                </Table>
            </MockThemeUpdate>
        );

        expect(screen.getAllByRole('rowgroup')[0]).toHaveAttribute('data-hidden', 'true');
        expect(screen.getAllByRole('row')[1]).toHaveTextContent('Braškės');
        expect(screen.getAllByRole('row')[1]).toHaveAttribute('data-hidden', 'true');
    });
});
