import { ActionIcon, Group, SegmentedControl, Stack } from '@mantine/core';
import React, { useCallback, useMemo } from 'react';

import { RecycledIcon } from '@icons';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useLabels } from '~/client/hooks/useLabels';
import { AnnotatedTotalAmounts } from '~/client/pages/products/AnnotatedTotalAmounts';
import { isPreferred } from '~/client/pages/products/ProductCell';
import { OLD_YEARS_THRESHOLD } from '~/client/pages/products/ProductCells';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { getCombinedAmounts } from '~/common/utils/amounts';
import type { ProductAmounts as ProductAmountsType } from '~/types/data';

import './ProductYearBar.pcss';

export interface ProductYearBarProps {
    disabled?: boolean;
}

// Shared between the Quantities and History tabs (rendered once, above both, in AmountBox) so
// the year context - which year is selected, which are archived/current, which are marked for
// removal - stays visible and controllable no matter which tab is open. Reads/writes the same
// active content the two tabs already key off of, rather than owning its own state.
export function ProductYearBar({ disabled = false }: ProductYearBarProps) {
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
                        size="sm"
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
                </Group>
            )}
            {liveAmounts.length > 0 && (
                <Group justify="center" data-year-total>
                    <AnnotatedTotalAmounts group={group} amounts={liveAmounts} />
                </Group>
            )}
        </Stack>
    );
}
