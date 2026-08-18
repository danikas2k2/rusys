import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveContentContext, createActiveContentStore } from '~/client/common/ActiveContentContext';
import { AnnotatedTotalAmounts } from '~/client/common/AnnotatedTotalAmounts';
import { OLD_YEARS_THRESHOLD, ProductYearBar } from '~/client/pages/products/ProductYearBar';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import type { ProductAmounts as ProductAmountsType } from '~/types/data';

vi.mock(import('~/client/common/AnnotatedTotalAmounts'), () => ({
    AnnotatedTotalAmounts: vi.fn(({ amounts }: any) => (amounts?.length ? <div>Annotated total</div> : null)),
}));

vi.mock(import('~/client/pages/products/UpdatingProductsContext'), () => ({
    useUpdatingProducts: vi.fn(() => [{}, vi.fn()]),
}));

vi.mock(import('~/client/state/products/useProducts'), () => ({
    useProducts: vi.fn(() => []),
}));

vi.mock(import('~/client/state/groups/useGroups'), () => ({
    useGroups: vi.fn(() => []),
}));

vi.mock(import('~/client/state/products/useSetProductRemoving'), () => ({
    useSetProductRemoving: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

describe('<ProductYearBar>', () => {
    const group = 'Uogienės';
    const baseActive: ProductAmountsType = {
        group,
        name: 'Avietės',
        year: 2023,
        amounts: [{ variant: 'p', amount: 3 }],
    };

    beforeEach(() => {
        vi.mocked(useProducts).mockReturnValue([]);
        vi.mocked(useGroups).mockReturnValue([]);
    });

    afterEach(() => vi.clearAllMocks());

    function renderBar(
        active: ProductAmountsType = baseActive,
        setActive?: (v?: any) => void,
        onHistoryYearChange?: () => void
    ) {
        return render(
            <MockThemeActive active={{ action: 'values', data: active }} setActive={setActive}>
                <ProductYearBar onHistoryYearChange={onHistoryYearChange} />
            </MockThemeActive>
        );
    }

    it('renders nothing when there is no active content', () => {
        const { container } = render(
            <MockThemeActive active={undefined}>
                <ProductYearBar />
            </MockThemeActive>
        );

        expect(container).toBeEmptyDOMElement();
    });

    describe('year switcher', () => {
        it('does not render when the group is not annual', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: false }]);
            renderBar();

            expect(screen.queryByRole('radio')).not.toBeInTheDocument();
        });

        it('renders year options including the active and current years when the group is annual', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [
                        { year: 2022, amounts: [] },
                        { year: 2023, amounts: [] },
                    ],
                },
            ]);
            renderBar();

            expect(screen.getByRole('radio', { name: '2023' })).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: '2022' })).toBeInTheDocument();
        });

        it('switches to the picked year', async () => {
            const setActive = vi.fn();
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [
                        { year: 2022, amounts: [{ variant: 'p', amount: 1 }] },
                        { year: 2023, amounts: baseActive.amounts },
                    ],
                },
            ]);

            renderBar(baseActive, setActive);

            await user.click(screen.getByRole('radio', { name: '2022' }));

            expect(setActive).toHaveBeenCalledWith({ action: 'values', data: { ...baseActive, year: 2022 } });
        });

        it('offers history-only years in a menu and opens their history', async () => {
            const setActive = vi.fn();
            const onHistoryYearChange = vi.fn();
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [{ year: 2023, amounts: baseActive.amounts }],
                    updates: [{ year: 2020 }],
                    undates: [{ year: 2019 }],
                },
            ]);

            renderBar(baseActive, setActive, onHistoryYearChange);

            await user.click(screen.getByRole('button', { name: 'History years' }));
            await user.click(screen.getByRole('menuitem', { name: '2020' }));

            expect(setActive).toHaveBeenCalledWith({ action: 'values', data: { ...baseActive, year: 2020 } });
            expect(onHistoryYearChange).toHaveBeenCalledOnce();
            expect(screen.queryByRole('menuitem', { name: '2023' })).not.toBeInTheDocument();
        });

        it('marks each newly selected history year as current', async () => {
            const store = createActiveContentStore<object>({ action: 'values', data: baseActive });
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [{ year: 2023, amounts: baseActive.amounts }],
                    updates: [{ year: 2020 }],
                    undates: [{ year: 2019 }],
                },
            ]);
            render(
                <MockThemeActive>
                    <ActiveContentContext value={store}>
                        <ProductYearBar />
                    </ActiveContentContext>
                </MockThemeActive>
            );

            await user.click(screen.getByRole('button', { name: 'History years' }));
            await user.click(screen.getByRole('menuitem', { name: '2020' }));
            expect(screen.getByText('2020')).toHaveAttribute('data-current');

            await user.click(screen.getByRole('button', { name: 'History years' }));
            await user.click(screen.getByRole('menuitem', { name: '2019' }));
            expect(screen.getByText('2019')).toHaveAttribute('data-current');
        });

        it('disables the switcher when disabled prop is set', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: 2023, amounts: baseActive.amounts }] },
            ]);

            render(
                <MockThemeActive active={{ action: 'values', data: baseActive }}>
                    <ProductYearBar disabled />
                </MockThemeActive>
            );

            expect(screen.getByRole('radio', { name: '2023' })).toBeDisabled();
        });

        it('marks a year old once it crosses the old-years threshold', () => {
            const thisYear = new Date().getFullYear() % 100;
            const oldYear = thisYear - OLD_YEARS_THRESHOLD;
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: oldYear, amounts: baseActive.amounts }] },
            ]);
            const { container } = renderBar({ ...baseActive, year: oldYear });

            expect(container.querySelector('[data-year-option][data-old]')).toHaveTextContent(String(oldYear));
        });

        it('does not mark a recent year old', () => {
            const thisYear = new Date().getFullYear() % 100;
            const recentYear = thisYear - (OLD_YEARS_THRESHOLD - 1);
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: recentYear, amounts: baseActive.amounts }] },
            ]);
            const { container } = renderBar({ ...baseActive, year: recentYear });

            expect(container.querySelector('[data-year-option][data-old]')).not.toBeInTheDocument();
        });

        it('marks the preferred year distinctly', () => {
            const thisYear = new Date().getFullYear() % 100;
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: thisYear, amounts: baseActive.amounts }] },
            ]);
            const { container } = renderBar({ ...baseActive, year: thisYear });

            expect(container.querySelector('[data-year-option][data-preferred]')).toHaveTextContent(String(thisYear));
        });

        it('marks the selected year as current', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            const { container } = renderBar();

            expect(container.querySelector('[data-year-option][data-current]')).toHaveTextContent(
                String(baseActive.year)
            );
        });

        it('marks a year flagged as removing distinctly', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [{ year: baseActive.year, amounts: baseActive.amounts, removing: true }],
                },
            ]);
            const { container } = renderBar();

            expect(container.querySelector('[data-year-option][data-removing]')).toHaveTextContent(
                String(baseActive.year)
            );
        });
    });

    describe('removing toggle', () => {
        it('does not render for a non-annual (year 0) product', () => {
            renderBar({ ...baseActive, year: 0 });

            expect(screen.queryByRole('button', { name: 'Removing this year?' })).not.toBeInTheDocument();
        });

        it('renders unpressed when the year has no removing flag', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: baseActive.year, amounts: baseActive.amounts }] },
            ]);
            renderBar();

            expect(screen.getByRole('button', { name: 'Removing this year?' })).toHaveAttribute(
                'aria-pressed',
                'false'
            );
        });

        it('renders pressed when the year is marked as removing', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [{ year: baseActive.year, amounts: baseActive.amounts, removing: true }],
                },
            ]);
            renderBar();

            expect(screen.getByRole('button', { name: 'Removing this year?' })).toHaveAttribute('aria-pressed', 'true');
        });

        it('toggles removing to true when clicked from unset', async () => {
            const setProductRemoving = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useSetProductRemoving).mockReturnValue(setProductRemoving);
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: baseActive.year, amounts: baseActive.amounts }] },
            ]);
            renderBar();

            await user.click(screen.getByRole('button', { name: 'Removing this year?' }));

            expect(setProductRemoving).toHaveBeenCalledWith(group, baseActive.name, baseActive.year, true);
        });

        it('toggles removing to false when clicked from set', async () => {
            const setProductRemoving = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useSetProductRemoving).mockReturnValue(setProductRemoving);
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [{ year: baseActive.year, amounts: baseActive.amounts, removing: true }],
                },
            ]);
            renderBar();

            await user.click(screen.getByRole('button', { name: 'Removing this year?' }));

            expect(setProductRemoving).toHaveBeenCalledWith(group, baseActive.name, baseActive.year, false);
        });

        it('disables the toggle when disabled prop is set', () => {
            vi.mocked(useGroups).mockReturnValue([{ group, order: 0, annual: true }]);
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: baseActive.year, amounts: baseActive.amounts }] },
            ]);
            render(
                <MockThemeActive active={{ action: 'values', data: baseActive }}>
                    <ProductYearBar disabled />
                </MockThemeActive>
            );

            expect(screen.getByRole('button', { name: 'Removing this year?' })).toBeDisabled();
        });
    });

    describe('total', () => {
        it('shows the annotated total for the selected year when liveAmounts is non-empty', () => {
            vi.mocked(useProducts).mockReturnValue([
                { group, name: baseActive.name, years: [{ year: baseActive.year, amounts: baseActive.amounts }] },
            ]);
            renderBar();

            expect(screen.getByText('Annotated total')).toBeInTheDocument();
            expect(AnnotatedTotalAmounts).toHaveBeenCalledWith(
                expect.objectContaining({ group, amounts: baseActive.amounts }),
                undefined
            );
        });

        it('shows nothing when there are no amounts for the selected context', () => {
            renderBar({ ...baseActive, amounts: [] });

            expect(screen.queryByText('Annotated total')).not.toBeInTheDocument();
        });

        it('combines amounts across years for a non-annual product (year 0)', () => {
            vi.mocked(useProducts).mockReturnValue([
                {
                    group,
                    name: baseActive.name,
                    years: [
                        { year: 2022, amounts: [{ variant: 'p', amount: 2 }] },
                        { year: 2023, amounts: [{ variant: 'p', amount: 1 }] },
                    ],
                },
            ]);
            renderBar({ ...baseActive, year: 0 });

            expect(AnnotatedTotalAmounts).toHaveBeenCalledWith(
                expect.objectContaining({ group, amounts: [{ variant: 'p', amount: 3 }] }),
                undefined
            );
        });
    });
});
