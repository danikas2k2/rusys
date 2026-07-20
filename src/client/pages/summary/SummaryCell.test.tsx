import { fireEvent, render, screen } from '@testing-library/react';
import { MockTableRow } from '@tests/MockTableRow';
import { MockTheme } from '@tests/MockTheme';
import { MockThemeActive } from '@tests/MockThemeActive';

import { Table } from '@mantine/core';
import React from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), (): any => ({
    useGroupVariantComparator: vi.fn(),
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
            <MockTheme>
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
            </MockTheme>
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
                        { variant: 'm', amount: 15 },
                        { variant: 'p', amount: 5 },
                        { variant: 'd', amount: 10 },
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
});
