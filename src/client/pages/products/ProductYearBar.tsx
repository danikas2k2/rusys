import { ActionIcon, Group, Menu, SegmentedControl, Stack } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { HistoryTabIcon, RecycledIcon } from '@icons';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useLabels } from '~/client/hooks/useLabels';
import { AnnotatedTotalAmounts } from '~/client/pages/products/AnnotatedTotalAmounts';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { getCombinedAmounts } from '~/common/utils/amounts';
import type { Product, ProductAmounts as ProductAmountsType, RemovingYearAmounts } from '~/types/data';

import '../common/YearTotal.pcss';
import './ProductYearBar.pcss';

export interface ProductYearBarProps {
    disabled?: boolean;
    onHistoryYearChange?: () => void;
}

export function getHistoryYears(history: Product['updates'] | Product['undates']): number[] {
    return history?.flatMap((entry) => ('year' in entry ? [entry.year] : entry.years.map(({ year }) => year))) ?? [];
}

export const OLD_YEARS_THRESHOLD = 4;

export function isPreferred(year: number, years: readonly RemovingYearAmounts[]): boolean {
    const thisYear = new Date().getFullYear() % 100;
    let maxOlderYear = -1;
    let hasThisYear = false;
    for (const y of years) {
        if (!y.amounts?.length || y.removing) {
            continue;
        }
        if (y.year < thisYear && y.year > maxOlderYear) {
            maxOlderYear = y.year;
        }
        if (y.year === thisYear) {
            hasThisYear = true;
        }
    }
    return maxOlderYear !== -1 ? year === maxOlderYear : year === thisYear && hasThisYear;
}

// Shared between the Quantities and History tabs (rendered once, above both, in AmountBox) so
// the year context - which year is selected, which are archived/current, which are marked for
// removal - stays visible and controllable no matter which tab is open. Reads/writes the same
// active content the two tabs already key off of, rather than owning its own state.
export function ProductYearBar({ disabled = false, onHistoryYearChange }: ProductYearBarProps) {
    const _ = useLabels();
    const [active, setActive] = useActiveContent<ProductAmountsType>();
    const [, setUpdating] = useUpdatingProducts();
    const setProductRemoving = useSetProductRemoving();
    const products = useProducts();
    const groups = useGroups();
    const thisYear = new Date().getFullYear() % 100;

    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;

    const activeProduct = useMemo(
        () =>
            activeData ? products.find((p) => p.group === activeData.group && p.name === activeData.name) : undefined,
        [activeData, products]
    );

    const isAnnual = groups.find((g) => g.group === group)?.annual;

    // thisYear and the currently active year are always included, even if neither has an entry
    // yet, so switching to a brand new year (or back to one just left) is possible.
    const yearOptions = useMemo(() => {
        const set = new Set([...(activeProduct?.years?.map((y) => y.year) ?? []), thisYear, year]);
        return Array.from(set).sort((a, b) => b - a);
    }, [activeProduct, thisYear, year]);

    // The product list includes compact update/undo metadata specifically so archived history
    // years can be discovered without loading each year's history. Keep them in a menu rather
    // than expanding the always-visible year control with a potentially long archive.
    const historyOnlyYears = useMemo(() => {
        const amountYears = new Set(activeProduct?.years?.map(({ year: amountYear }) => amountYear) ?? []);
        return Array.from(
            new Set([...getHistoryYears(activeProduct?.updates), ...getHistoryYears(activeProduct?.undates)])
        )
            .filter((historyYear) => historyYear > 0 && !amountYears.has(historyYear))
            .sort((a, b) => b - a);
    }, [activeProduct]);

    const liveAmounts = useMemo(
        () =>
            activeProduct
                ? ((year
                      ? activeProduct.years?.find((y) => y.year === year)?.amounts
                      : getCombinedAmounts(activeProduct.years)) ?? [])
                : (activeData?.amounts ?? []),
        [activeProduct, year, activeData]
    );

    const removingYear = !!activeProduct?.years?.find((y) => y.year === year)?.removing;

    const handleYearChange = useCallback(
        (newYear: number) => {
            if (!activeData) {
                return;
            }
            setActive({ action: 'values', data: { ...activeData, year: newYear } });
        },
        [activeData, setActive]
    );

    const handleHistoryYearChange = useCallback(
        (historyYear: number) => {
            handleYearChange(historyYear);
            onHistoryYearChange?.();
        },
        [handleYearChange, onHistoryYearChange]
    );

    const handleToggleRemoving = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setUpdating(activeData, true);
        await setProductRemoving(group, name, year, !removingYear).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, removingYear, setUpdating, setProductRemoving]);

    if (!activeData) {
        return null;
    }

    return (
        <Stack gap={4} data-year-bar>
            {isAnnual && (
                <Group gap="xs" wrap="nowrap" align="center">
                    <SegmentedControl
                        key={year}
                        size="sm"
                        withItemsBorders={false}
                        style={{ flex: 1 }}
                        data={yearOptions.map((y) => {
                            const old = y <= thisYear - OLD_YEARS_THRESHOLD;
                            const preferred = isPreferred(y, activeProduct?.years ?? []);
                            const removing = !!activeProduct?.years?.find((yy) => yy.year === y)?.removing;
                            return {
                                value: String(y),
                                label: (
                                    <span
                                        data-year-option
                                        data-current={y === year || undefined}
                                        data-old={old || undefined}
                                        data-preferred={preferred || undefined}
                                        data-removing={removing || undefined}
                                    >
                                        {y}
                                    </span>
                                ),
                            };
                        })}
                        value={String(year)}
                        onChange={(v) => handleYearChange(Number(v))}
                        disabled={disabled}
                    />
                    {!!year && (
                        <ActionIcon
                            variant={removingYear ? 'filled' : 'subtle'}
                            color={removingYear ? 'negative' : 'gray'}
                            onClick={handleToggleRemoving}
                            disabled={disabled}
                            aria-label={_('Removing this year?')}
                            aria-pressed={removingYear}
                        >
                            <RecycledIcon size={16} />
                        </ActionIcon>
                    )}
                    {historyOnlyYears.length > 0 && (
                        <Menu position="bottom-end" withinPortal={false}>
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    disabled={disabled}
                                    aria-label={_('History years')}
                                >
                                    <HistoryTabIcon size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown
                                className="history-years-menu-dropdown"
                                style={{ maxHeight: 240, overflowY: 'auto' }}
                            >
                                {historyOnlyYears.map((historyYear) => (
                                    <Menu.Item
                                        key={historyYear}
                                        className="history-years-menu-item"
                                        data-current={historyYear === year || undefined}
                                        onClick={() => handleHistoryYearChange(historyYear)}
                                    >
                                        {historyYear}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>
            )}
            {liveAmounts.length > 0 && (
                <Group justify="center" data-year-total data-dialog-year-total>
                    <AnnotatedTotalAmounts group={group} amounts={liveAmounts} />
                </Group>
            )}
        </Stack>
    );
}
