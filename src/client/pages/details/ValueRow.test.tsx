import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDetailsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { Table } from '@mantine/core';

import { ValueRow, type ValueRowProps } from '~/client/pages/details/ValueRow';
import { useHasRemoving } from '~/client/state/details/useHasRemoving';
import { useSetDetailsMissing } from '~/client/state/details/useSetDetailsMissing';
import { useSetDetailsRemoving } from '~/client/state/details/useSetDetailsRemoving';
import { useUpdateDetails } from '~/client/state/details/useUpdateDetails';
import type { WithVariantsState } from '~/client/state/variants/types';
import { useYears } from '~/client/state/years/useYears';

jest.mock('~/client/state/details/useUpdateDetails', () => ({
    useUpdateDetails: jest.fn(),
}));
jest.mock('~/client/state/details/useSetDetailsMissing', () => ({
    useSetDetailsMissing: jest.fn(),
}));
jest.mock('~/client/state/details/useSetDetailsRemoving', () => ({
    useSetDetailsRemoving: jest.fn(),
}));
jest.mock('~/client/state/details/useHasRemoving', () => ({
    useHasRemoving: jest.fn(),
}));
jest.mock('~/client/state/years/useYears');
jest.mock('~/client/state/profile/useProfile');

describe('<ValueRow>', () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const updateAmounts = jest.fn();
    const setMissing = jest.fn();
    const setRemoving = jest.fn();

    beforeAll(() => {
        jest.mocked(useUpdateDetails).mockReturnValue(updateAmounts);
        jest.mocked(useSetDetailsMissing).mockReturnValue(setMissing);
        jest.mocked(useSetDetailsRemoving).mockReturnValue(setRemoving);
    });

    beforeEach(() => jest.useFakeTimers());

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => jest.useRealTimers());

    const variants = getVariantsFixture();
    const state: WithVariantsState = { variants };
    const details = getDetailsFixture();
    const props: ValueRowProps = details[3];
    const { group, name } = props;

    describe('with value', () => {
        it('renders into the document', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells with values only for matching years', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // First cell is checkbox/name, then year cells: 23, 22, 21
            // props (details[3]) has year 21 with amount 2
            expect(cells).toHaveListWithTextContent(['Kopūstai', '.', '.', '2']);
        });

        it('renders cells without values', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(2);
        });

        it('renders last cell with data-last attribute', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');
            const lastCell = cells.at(-1);

            expect(lastCell).toHaveAttribute('data-last', 'true');
        });

        it('renders name heading without data-unavailable attribute', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const heading = screen.getByRole('heading', { name });

            expect(heading).not.toHaveAttribute('data-unavailable');
        });

        it('renders name heading without data-removing attribute', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const heading = screen.getByRole('heading', { name });

            expect(heading).not.toHaveAttribute('data-removing');
        });

        it('renders with removing state when hasRemoving is true', () => {
            jest.mocked(useHasRemoving).mockReturnValue(true);
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const heading = screen.getByRole('heading', { name });

            // Heading should be in the document when hasRemoving is true
            expect(heading).toBeInTheDocument();
        });

        it('renders available row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('checkbox')).toBeEnabled().toBeChecked();
        });

        it('calls setMissing with true when clicking on available row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setMissing).toHaveBeenCalledWith(group, name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} missing />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('checkbox')).toBeEnabled().not.toBeChecked();
        });

        it('calls setMissing with false when clicking on unchecked checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} missing />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setMissing).toHaveBeenCalledWith(group, name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with true when clicking on checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setMissing).toHaveBeenCalledWith(group, name, true);
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('calls setMissing with false when clicking on missing checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} missing />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setMissing).toHaveBeenCalledWith(group, name, false);
            expect(setRemoving).not.toHaveBeenCalled();
        });
    });

    describe('without value', () => {
        it('renders into the document', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('row')).toBeInTheDocument();
        });

        it('renders cells without values', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getAllByRole('cell', { name: '.' })).toHaveLength(3);
        });

        it('renders last cell with data-last attribute', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');
            const lastCell = cells.at(-1);

            expect(lastCell).toHaveAttribute('data-last', 'true');
        });

        it('renders with unavailable state when years is empty', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const heading = screen.getByRole('heading', { name });

            // Heading should be in the document when unavailable
            expect(heading).toBeInTheDocument();
        });

        it('renders name heading without data-removing attribute', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const heading = screen.getByRole('heading', { name });

            expect(heading).toHaveAttribute('data-removing', 'false');
        });

        it('renders name heading without data-removing attribute even when has removing', () => {
            jest.mocked(useHasRemoving).mockReturnValue(true);
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const heading = screen.getByRole('heading', { name });

            expect(heading).toHaveAttribute('data-removing', 'false');
        });

        it('renders available row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('checkbox')).toBeDisabled().toBePartiallyChecked();
        });

        it('does not call addMissing when clicking on available row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('renders missing row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} missing />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('checkbox')).toBeDisabled().toBePartiallyChecked();
        });

        it('does not call setRemoving when clicking on missing row checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} missing />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setRemoving).not.toHaveBeenCalledWith();
            expect(setMissing).not.toHaveBeenCalled();
        });

        it('does not call addMissing when clicking on disabled checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setMissing).not.toHaveBeenCalled();
            expect(setRemoving).not.toHaveBeenCalled();
        });

        it('does not call setRemoving when clicking on missing disabled checkbox', async () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} years={[]} missing />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            await user.click(screen.getByRole('checkbox'));

            expect(setRemoving).not.toHaveBeenCalled();
            expect(setMissing).not.toHaveBeenCalled();
        });
    });

    describe('annual mode', () => {
        it('renders separate cells for each year when annual is true', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} annual />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // First cell is checkbox/name, then 3 year cells (23, 22, 21)
            expect(cells).toHaveLength(4);
        });

        it('renders combined amounts in single cell when annual is false', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} annual={false} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // First cell is checkbox/name, then one combined cell
            expect(cells).toHaveLength(2);
        });

        it('passes span property to ValueCell when annual is false', () => {
            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...props} annual={false} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cell = screen.getAllByRole('cell')[1];

            expect(cell).toHaveAttribute('colspan', '3');
        });
    });

    describe('isPreferred logic', () => {
        beforeAll(() => {
            // Mock useYears to use fixture years plus current year
            jest.mocked(useYears).mockReturnValue([23, 22, 21, 20]);
        });

        beforeEach(() => {
            // Mock current date to be in year 23 (2023)
            jest.useFakeTimers({ now: new Date('2023-06-15') });
        });

        afterAll(() => jest.useRealTimers());

        it('marks prevYear (22) as preferred when it has amounts', () => {
            const propsWithPrevYear: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [{ year: 22, amounts: [{ variant: 'p', amount: 5 }] }],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithPrevYear} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 22 cell should have preferred styling (index 2: name, 23, 22, 21, 20)
            expect(cells[2]).toHaveAttribute('data-preferred', 'true');
        });

        it('marks thisYear (23) as not preferred when prevYear has amounts', () => {
            const propsWithBothYears: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [
                    { year: 23, amounts: [{ variant: 'p', amount: 3 }] },
                    { year: 22, amounts: [{ variant: 'p', amount: 5 }] },
                ],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithBothYears} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 22 cell (index 2, after name and year 23)
            expect(cells[2]).toHaveAttribute('data-preferred', 'true');
            // Year 23 cell (index 1)
            expect(cells[1]).toHaveAttribute('data-preferred', 'false');
        });

        it('marks thisYear (23) as preferred when prevYear is removing', () => {
            const propsWithRemovingPrev: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [
                    { year: 23, amounts: [{ variant: 'p', amount: 3 }] },
                    { year: 22, amounts: [{ variant: 'p', amount: 5 }], removing: true },
                ],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithRemovingPrev} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 23 cell should be preferred when prevYear is removing
            expect(cells[1]).toHaveAttribute('data-preferred', 'true');
        });

        it('marks older year as preferred when no newer years have amounts', () => {
            const propsWithOldYear: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [{ year: 20, amounts: [{ variant: 'p', amount: 5 }] }],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithOldYear} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 20 cell (last cell, index 4: name, 23, 22, 21, 20)
            expect(cells[4]).toHaveAttribute('data-preferred', 'true');
        });

        it('marks older year as not preferred when newer year has amounts', () => {
            const propsWithMultipleYears: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 4 }] },
                    { year: 20, amounts: [{ variant: 'p', amount: 5 }] },
                ],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithMultipleYears} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 21 cell should be preferred (index 3)
            expect(cells[3]).toHaveAttribute('data-preferred', 'true');
            // Year 20 cell should not be preferred (index 4)
            expect(cells[4]).toHaveAttribute('data-preferred', 'false');
        });

        it('marks older year as preferred when newer year is removing', () => {
            const propsWithRemovingNewer: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 4 }], removing: true },
                    { year: 20, amounts: [{ variant: 'p', amount: 5 }] },
                ],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithRemovingNewer} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 20 cell should be preferred when year 21 is removing (index 4)
            expect(cells[4]).toHaveAttribute('data-preferred', 'true');
        });

        it('marks thisYear as preferred when no prevYear exists', () => {
            const propsWithOnlyThisYear: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: [{ year: 23, amounts: [{ variant: 'p', amount: 3 }] }],
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithOnlyThisYear} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
            const cells = screen.getAllByRole('cell');

            // Year 23 cell should be preferred when no prevYear with amounts
            expect(cells[1]).toHaveAttribute('data-preferred', 'true');
        });

        it('handles undefined years prop', () => {
            const propsWithoutYears: ValueRowProps = {
                group: 'Uogienės',
                name: 'Aviečių',
                years: undefined,
            };

            render(
                <MockApp state={state}>
                    <Table>
                        <Table.Tbody>
                            <ValueRow {...propsWithoutYears} />
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );

            expect(screen.getByRole('row')).toBeInTheDocument();
        });
    });
});
