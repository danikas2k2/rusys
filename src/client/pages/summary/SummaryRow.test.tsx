import { render, screen } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Table } from '@mantine/core';

import { useSummaryYears } from '~/client/pages/summary/hooks/useSummaryYears';
import { SummaryRow } from '~/client/pages/summary/SummaryRow';
import type { WithVariantsState } from '~/client/state/variants/types';

vi.mock('~/client/pages/summary/hooks/useSummaryYears');

describe('<SummaryRow>', () => {
    const variants = getVariantsFixture();
    const state: WithVariantsState = { variants };

    beforeAll(() => vi.mocked(useSummaryYears).mockReturnValue([23, 22, 21]));

    afterEach(() => vi.clearAllMocks());

    it('renders row with name', () => {
        render(
            <MockApp state={state}>
                <Table>
                    <Table.Tbody>
                        <SummaryRow group="Uogienės" name="Aviečių" />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Aviečių' })).toBeInTheDocument();
    });

    it('renders cell for each year', () => {
        render(
            <MockApp state={state}>
                <Table>
                    <Table.Tbody>
                        <SummaryRow group="Uogienės" name="Aviečių" />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        const cells = screen.getAllByRole('cell');

        // First cell is name, then 3 year cells
        expect(cells).toHaveLength(4);
    });

    it('renders amounts for matching years', () => {
        const amounts = [
            { year: 23, amounts: [{ variant: 'p', amount: 5 }] },
            { year: 21, amounts: [{ variant: 'd', amount: 3 }] },
        ];

        render(
            <MockApp state={state}>
                <Table>
                    <Table.Tbody>
                        <SummaryRow group="Uogienės" name="Aviečių" amounts={amounts} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        const cells = screen.getAllByRole('cell');

        // Year 23 cell has amount, year 22 empty, year 21 has amount
        expect(cells[1]).toHaveTextContent('5');
        expect(cells[2]).toHaveTextContent('.');
        expect(cells[3]).toHaveTextContent('3');
    });

    it('renders empty cells when no amounts provided', () => {
        render(
            <MockApp state={state}>
                <Table>
                    <Table.Tbody>
                        <SummaryRow group="Uogienės" name="Aviečių" />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        const cells = screen.getAllByRole('cell');

        // All year cells should be empty (except name cell)
        expect(cells[1]).toHaveTextContent('.');
        expect(cells[2]).toHaveTextContent('.');
        expect(cells[3]).toHaveTextContent('.');
    });

    it('passes group prop to SummaryCell', () => {
        const amounts = [{ year: 23, amounts: [{ variant: 'p', amount: 5 }] }];

        const { container } = render(
            <MockApp state={state}>
                <Table>
                    <Table.Tbody>
                        <SummaryRow group="Uogienės" name="Aviečių" amounts={amounts} />
                    </Table.Tbody>
                </Table>
            </MockApp>
        );

        // SummaryCell should render the amounts
        expect(container).toBeInTheDocument();
    });
});
