import { fireEvent, render, screen } from '@testing-library/react';
import { MockTableRow } from '@tests/MockTableRow';
import { MockTheme } from '@tests/MockTheme';
import { MockThemeActive } from '@tests/MockThemeActive';

import { Table } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useAmountView } from '~/client/common/AmountViewContext';
import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), (): any => ({
    useGroupVariantComparator: vi.fn(),
}));

vi.mock(import('~/client/common/AmountViewContext'), (): any => ({
    useAmountView: vi.fn(() => ['total', vi.fn()]),
}));

vi.mock(import('~/client/state/variants/useVariantsByGroup'), (): any => ({
    useVariantsByGroup: vi.fn(() => []),
}));

vi.mock(import('~/client/common/ActiveContentContext'), async (): Promise<any> => ({
    ...(await vi.importActual('~/client/common/ActiveContentContext')),
    useActiveContent: vi.fn(() => [undefined, vi.fn()]),
}));

vi.mock(import('~/client/common/AmountSuffix'), (): any => ({
    AmountSuffix: () => null,
}));

describe('<SummaryCell>', () => {
    const mockCompareVariants = vi.fn((a: string, b: string) => a.localeCompare(b));

    beforeAll(() => {
        vi.mocked(useGroupVariantComparator).mockReturnValue(mockCompareVariants);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders empty cell when no amounts provided', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" name="Avietės" year={2023} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const cell = screen.getByRole('cell');

        expect(cell).toHaveTextContent('.');
        expect(cell).toHaveAttribute('data-empty', 'true');
    });

    it('renders empty cell when amounts array is empty', () => {
        render(
            <MockTheme>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" name="Avietės" year={2023} amounts={[]} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockTheme>
        );

        const cell = screen.getByRole('cell');

        expect(cell).toHaveTextContent('.');
        expect(cell).toHaveAttribute('data-empty', 'true');
    });

    it('renders single variant amount', () => {
        render(
            <MockTableRow>
                <SummaryCell
                    group="Uogienės"
                    name="Avietės"
                    year={2023}
                    amounts={[{ variant: 'p', amount: 5, recycled: false }]}
                />
            </MockTableRow>
        );

        const cell = screen.getByRole('cell');

        expect(cell).toHaveTextContent('5');
        expect(cell).toHaveAttribute('data-empty', 'false');
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
                    name="Avietės"
                    year={2023}
                    amounts={[
                        { variant: 'm', amount: 15, recycled: false },
                        { variant: 'p', amount: 5, recycled: false },
                        { variant: 'd', amount: 10, recycled: false },
                    ]}
                />
            </MockTableRow>
        );

        const cell = screen.getByRole('cell');

        expect(cell).toHaveAttribute('data-empty', 'false');
        expect(cell).toHaveTextContent('5' + '10' + '15');
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
                <SummaryCell group="Uogienės" name="Avietės" year={2023} amounts={amounts} />
            </MockTableRow>
        );

        expect(amounts).toStrictEqual(originalAmounts);
    });

    it('calls setActive with correct data when cell is clicked', () => {
        const setActive = vi.fn();
        vi.mocked(useActiveContent).mockReturnValue([undefined, setActive]);

        render(
            <MockThemeActive setActive={setActive}>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell
                                group="Uogienės"
                                name="Avietės"
                                year={2023}
                                amounts={[{ variant: 'p', amount: 5 }]}
                            />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockThemeActive>
        );

        fireEvent.click(screen.getByRole('cell'));

        expect(setActive).toHaveBeenCalledWith({
            action: 'history',
            data: {
                group: 'Uogienės',
                name: 'Avietės',
                year: 2023,
                amounts: [{ variant: 'p', amount: 5 }],
            },
        });
    });

    it('passes amounts as empty array when undefined in click handler', () => {
        const setActive = vi.fn();
        vi.mocked(useActiveContent).mockReturnValue([undefined, setActive]);

        render(
            <MockThemeActive setActive={setActive}>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <SummaryCell group="Uogienės" name="Avietės" year={2023} />
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </MockThemeActive>
        );

        fireEvent.click(screen.getByRole('cell'));

        expect(setActive).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ amounts: [] }),
            })
        );
    });

    describe('home balance', () => {
        beforeEach(() => {
            vi.mocked(useGroupVariantComparator).mockReturnValue(mockCompareVariants);
            vi.mocked(useAmountView).mockReturnValue(['total', vi.fn()]);
            vi.mocked(useVariantsByGroup).mockReturnValue([]);
        });

        it('shows no home section when no home amounts in amounts prop', () => {
            render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[{ variant: 'p', amount: 5, recycled: false }]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(cell).not.toHaveTextContent('~');
        });

        it('shows tilde icon and amount for home balance amounts (recycled == null, home: true)', () => {
            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[{ variant: 'p', amount: 7, home: true }]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
            expect(cell).toHaveTextContent('7');
        });

        it('shows multiple home variants sorted by comparator', () => {
            mockCompareVariants.mockImplementation((a: string, b: string) => {
                const order: Record<string, number> = { p: 1, d: 2, m: 3 };
                return (order[a] ?? 99) - (order[b] ?? 99);
            });
            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[
                            { variant: 'm', amount: 8, home: true },
                            { variant: 'p', amount: 3, home: true },
                        ]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(container.querySelectorAll('.tabler-icon-tilde')).toHaveLength(2);
            expect(cell).toHaveTextContent('3');
            expect(cell).toHaveTextContent('8');
        });

        it('aggregates home amounts by units into volume/weight/count totals in the total view', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([
                { group: 'Uogienės', variant: 'p', order: 0, units: 'ml', count: 500 },
                { group: 'Uogienės', variant: 'd', order: 1, units: 'g', count: 250 },
                { group: 'Uogienės', variant: 'm', order: 2, units: 'vnt', count: 1 },
            ]);

            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[
                            { variant: 'p', amount: 2, home: true },
                            { variant: 'd', amount: 4, home: true },
                            { variant: 'm', amount: 3, home: true },
                        ]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(container.querySelectorAll('.tabler-icon-tilde')).toHaveLength(3);
            expect(cell).toHaveTextContent('1l'); // 2*500ml = 1000ml = 1l
            expect(cell).toHaveTextContent('1kg'); // 4*250g = 1000g = 1kg
            expect(cell).toHaveTextContent('3'); // 3*1 = 3 count
        });

        it('cell is empty when home amounts prop is empty', () => {
            render(
                <MockTableRow>
                    <SummaryCell group="Uogienės" name="Avietės" year={2023} />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(cell).toHaveTextContent('.');
            expect(cell).toHaveAttribute('data-empty', 'true');
        });

        it('cell is not empty when only home balance amounts provided', () => {
            render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[{ variant: 'p', amount: 6, home: true }]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(cell).toHaveAttribute('data-empty', 'false');
            expect(cell).not.toHaveTextContent('.');
        });

        it('consumed and home balance shown together', () => {
            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[
                            { variant: 'p', amount: 3, recycled: false },
                            { variant: 'p', amount: 4, home: true },
                        ]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(cell).toHaveTextContent('3');
            expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
            expect(cell).toHaveTextContent('4');
        });

        it('shows home amounts as a plain per-variant list in detailed view', () => {
            vi.mocked(useAmountView).mockReturnValue(['detailed', vi.fn()]);

            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[{ variant: 'p', amount: 7, home: true }]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
            expect(cell).toHaveTextContent('7');
        });

        it('sorts multiple home amounts by comparator in detailed view', () => {
            vi.mocked(useAmountView).mockReturnValue(['detailed', vi.fn()]);
            mockCompareVariants.mockImplementation((a: string, b: string) => {
                const order: Record<string, number> = { p: 1, d: 2, m: 3 };
                return (order[a] ?? 99) - (order[b] ?? 99);
            });

            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[
                            { variant: 'm', amount: 8, home: true },
                            { variant: 'p', amount: 3, home: true },
                        ]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(container.querySelectorAll('.tabler-icon-tilde')).toHaveLength(2);
            expect(cell).toHaveTextContent('3');
            expect(cell).toHaveTextContent('8');
        });

        it('recycled amounts are shown separately and do not affect home section', () => {
            const { container } = render(
                <MockTableRow>
                    <SummaryCell
                        group="Uogienės"
                        name="Avietės"
                        year={2023}
                        amounts={[
                            { variant: 'p', amount: 10, recycled: true },
                            { variant: 'p', amount: 5, home: true },
                        ]}
                    />
                </MockTableRow>
            );
            const cell = screen.getByRole('cell');

            expect(cell).toHaveTextContent('10');
            expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
            expect(cell).toHaveTextContent('5');
        });
    });
});
