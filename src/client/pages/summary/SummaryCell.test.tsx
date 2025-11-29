import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Table } from '@mantine/core';

import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';

vi.mock('~/client/state/variants/useGroupVariantComparator', async () => ({
    useGroupVariantComparator: vi.fn(),
}));

vi.mock('~/client/common/ValueSuffix', async () => ({
    ValueSuffix: () => null,
}));

describe('<SummaryCell>', () => {
    const mockCompareVariants = vi.fn((a: string, b: string) => a.localeCompare(b));

    beforeAll(() => vi.mocked(useGroupVariantComparator).mockReturnValue(mockCompareVariants));

    afterEach(() => vi.clearAllMocks());

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
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell
                                group="Uogienės"
                                amounts={[
                                    { variant: 'm', amount: 15 },
                                    { variant: 'p', amount: 5 },
                                    { variant: 'd', amount: 10 },
                                ]}
                            />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const cell = screen.getByRole('cell');
        const values = Array.from(cell.querySelectorAll('span')).map((span) => span.textContent);

        expect(cell).toHaveAttribute('data-empty', 'false');
        expect(values).toStrictEqual(['5', '10', '15']);
        expect(mockCompareVariants).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });

    it('does not mutate original amounts array', () => {
        const amounts = [
            { variant: 'm', amount: 15 },
            { variant: 'p', amount: 5 },
        ];
        const originalAmounts = [...amounts];

        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" amounts={amounts} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        expect(amounts).toStrictEqual(originalAmounts);
    });
});
