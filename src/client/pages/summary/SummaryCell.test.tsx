import { render, screen } from '@testing-library/react';
import { MockTableRow } from '@tests/MockTableRow';
import { MockTheme } from '@tests/MockTheme';

import { Table } from '@mantine/core';
import React from 'react';

import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';

jest.mock('~/client/state/variants/useGroupVariantComparator', () => ({
    useGroupVariantComparator: jest.fn(),
}));

jest.mock('~/client/common/AmountSuffix', () => ({
    AmountSuffix: () => null,
}));

describe('<SummaryCell>', () => {
    const mockCompareVariants = jest.fn((a: string, b: string) => a.localeCompare(b));

    beforeAll(() => jest.mocked(useGroupVariantComparator).mockReturnValue(mockCompareVariants));

    afterEach(() => jest.clearAllMocks());

    it('renders empty cell when no amounts provided', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getByRole('cell')).toHaveTextContent('.').toHaveAttribute('data-empty', 'true');
    });

    it('renders empty cell when amounts array is empty', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" amounts={[]} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getByRole('cell')).toHaveTextContent('.').toHaveAttribute('data-empty', 'true');
    });

    it('renders single variant amount', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" amounts={[{ variant: 'p', amount: 5 }]} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(screen.getByRole('cell')).toHaveTextContent('5').toHaveAttribute('data-empty', 'false');
    });

    it('renders multiple variant amounts sorted by comparator', () => {
        mockCompareVariants.mockImplementation((a: string, b: string) => {
            const order = { p: 1, d: 2, m: 3 };
            return order[a as keyof typeof order] - order[b as keyof typeof order];
        });

        render(
            <MockTableRow>
                <SummaryCell
                    group="Uogienės"
                    amounts={[
                        { variant: 'm', amount: 15 },
                        { variant: 'p', amount: 5 },
                        { variant: 'd', amount: 10 },
                    ]}
                />
            </MockTableRow>
        );

        expect(screen.getByRole('cell'))
            .toHaveAttribute('data-empty', 'false')
            .toHaveTextContent('5' + '10' + '15');
        expect(mockCompareVariants).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });

    it('does not mutate original amounts array', () => {
        const amounts = [
            { variant: 'm', amount: 15 },
            { variant: 'p', amount: 5 },
        ];
        const originalAmounts = [...amounts];

        render(
            <MockTableRow>
                <SummaryCell group="Uogienės" amounts={amounts} />
            </MockTableRow>
        );

        expect(amounts).toStrictEqual(originalAmounts);
    });
});
