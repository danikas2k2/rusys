import { fireEvent, render, screen } from '@testing-library/react';
import { MockTableRow } from '@tests/MockTableRow';
import { MockTheme } from '@tests/MockTheme';
import { MockThemeActive } from '@tests/MockThemeActive';

import { Table } from '@mantine/core';
import React from 'react';

import { SummaryCell } from '~/client/pages/summary/SummaryCell';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';

jest.mock('~/client/state/variants/useGroupVariantComparator', () => ({
    useGroupVariantComparator: jest.fn(),
}));

jest.mock('~/client/common/ActiveContentContext', () => ({
    ...jest.requireActual('~/client/common/ActiveContentContext'),
    useActiveContent: jest.fn(() => [undefined, jest.fn()]),
}));

jest.mock('~/client/common/UpdateTypeContext', () => ({
    ...jest.requireActual('~/client/common/UpdateTypeContext'),
    useUpdateType: jest.fn(() => ['consumed', jest.fn()]),
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
                            <SummaryCell group="Uogienės" name="Avietės" year={2023} />
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
                            <SummaryCell group="Uogienės" name="Avietės" year={2023} amounts={[]} />
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
                            <SummaryCell group="Uogienės" name="Avietės" year={2023} amounts={[{ variant: 'p', amount: 5 }]} />
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
                <SummaryCell group="Uogienės" name="Avietės" year={2023} amounts={amounts} />
            </MockTableRow>
        );

        expect(amounts).toStrictEqual(originalAmounts);
    });

    it('calls setActive with correct data when cell is clicked', () => {
        const setActive = jest.fn();
        const { useActiveContent } = jest.requireMock('~/client/common/ActiveContentContext');
        useActiveContent.mockReturnValue([undefined, setActive]);

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
                updateType: 'consumed',
            },
        });
    });

    it('passes amounts as empty array when undefined in click handler', () => {
        const setActive = jest.fn();
        const { useActiveContent } = jest.requireMock('~/client/common/ActiveContentContext');
        useActiveContent.mockReturnValue([undefined, setActive]);

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
