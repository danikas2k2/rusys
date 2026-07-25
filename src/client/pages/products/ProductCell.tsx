import { Center, Loader, Table } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useSetActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { useLongPress } from '~/client/hooks/useLongPress';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import { useProductUpdating } from '~/client/pages/products/UpdatingProductsContext';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import { getCombinedAmounts } from '~/common/utils/amounts';
import type { Product, ProductAmounts as ProductAmountsType, RemovingYearAmounts } from '~/types/data';

import './ProductCell.pcss';

export interface ProductCellProps {
    product: Product;
    year?: number;
    last?: boolean;
    span?: number;
}

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

export function ProductCell({ product, year = 0, last = false, span }: ProductCellProps) {
    const { group, name, years } = product;
    const { amounts, removing = false } = useMemo(
        (): RemovingYearAmounts =>
            (year
                ? years?.find((y) => y.year === year)
                : ({ amounts: getCombinedAmounts(years) } as RemovingYearAmounts)) ?? ({} as RemovingYearAmounts),
        [year, years]
    );

    const preferred = useMemo(
        () => (!year || removing || !amounts?.length || !years?.length ? false : isPreferred(year, years)),
        [amounts?.length, removing, year, years]
    );

    const setActive = useSetActiveContent<ProductAmountsType>();
    const setRemoving = useSetProductRemoving();
    const updating = useProductUpdating({ group, name, year });
    const swipeActive = useSwipeVisible();

    const [loaderVisible, setLoaderVisible] = useState(false);

    useEffect(() => {
        if (updating) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoaderVisible(true);
        }
    }, [updating]);

    const handleTransitionEnd = useCallback(() => {
        if (!updating) {
            setLoaderVisible(false);
        }
    }, [updating]);

    const handleClick = useCallback(
        () => setActive({ action: 'values', data: { group, name, year, amounts } }),
        [setActive, group, name, year, amounts]
    );

    // TODO add setRemoving to edit dialog
    const handleLongPress = useCallback(
        () => setRemoving(group, name, year, !removing),
        [setRemoving, group, name, year, removing]
    );

    const empty = !amounts?.length;
    const longPress = useLongPress<HTMLTableCellElement>({
        onClick: handleClick,
        onLongPress: empty ? undefined : handleLongPress,
    });
    const eventHandlers = updating || swipeActive ? {} : longPress;
    return (
        <Table.Td
            data-cell
            data-empty={empty}
            data-last={last}
            data-preferred={preferred}
            data-updating={updating}
            data-removing={removing}
            data-full={!!span}
            colSpan={span}
            {...eventHandlers}
        >
            <Center>{empty ? '.' : <ProductAmounts group={group} amounts={amounts} />}</Center>
            {loaderVisible && <Loader data-visible={updating} size="sm" onTransitionEnd={handleTransitionEnd} />}
        </Table.Td>
    );
}
