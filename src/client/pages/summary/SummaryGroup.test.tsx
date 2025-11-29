import { render, screen } from '@testing-library/react';
import { MockThemeUpdate } from '@tests/MockThemeUpdate';

import React from 'react';

import { Table } from '@mantine/core';

import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryGroup } from '~/client/pages/summary/SummaryGroup';

vi.mock('~/client/pages/summary/hooks/useSummaryYears');
vi.mock('~/client/pages/summary/SummaryRow', async () => ({
    SummaryRow: ({ name }: { name: string }) => (
        <tr>
            <td>{name}</td>
        </tr>
    ),
}));
vi.mock('~/client/table/GroupTitle', async () => ({
    GroupTitle: ({ children, bg }: { children: string; bg: string }) => (
        <tbody>
            <tr>
                <td data-bg={bg}>{children}</td>
            </tr>
        </tbody>
    ),
}));

describe('<SummaryGroup>', () => {
    beforeAll(() => vi.mocked(useSummaryYears).mockReturnValue([23, 22, 21]));

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

        expect(screen.getAllByRole('rowgroup')).toHaveListWithTextContent(['Uogienės']);
    });
});
