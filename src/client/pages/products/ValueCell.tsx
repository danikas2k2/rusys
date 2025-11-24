import React, { useCallback, useEffect, useState } from 'react';

import { Center, Loader, Table } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useSwipeVisible } from '~/client/common/hooks/useSwipeVisible';
import { useLongPress } from '~/client/hooks/useLongPress';
import { useProductUpdating } from '~/client/pages/products/UpdatingProductsContext';
import { ValueAmounts } from '~/client/pages/products/ValueAmounts';
import { useSetProductRemoving } from '~/client/state/products/useSetProductRemoving';
import type { ProductAmounts } from '~/types/data';
import cx from './ValueCell.pcss';

export interface ValueCellProps extends ProductAmounts {
    preferred?: boolean;
    removing?: boolean;
    last?: boolean;
    span?: number;
}

const LONG_PRESS_VIBRATE_DURATION = 500;

export function ValueCell({
    group,
    name,
    year,
    amounts,
    preferred,
    removing = false,
    last = false,
    span,
}: ValueCellProps) {
    const [, setActive] = useActiveContent<ProductAmounts>();
    const setRemoving = useSetProductRemoving();
    const updatingYear = span ? 0 : year;
    const updating = useProductUpdating({ group, name, year: updatingYear });
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
        () => setActive({ action: 'values', data: { group, name, year: updatingYear, amounts } }),
        [setActive, group, name, updatingYear, amounts]
    );

    // TODO add setRemoving to edit dialog
    const handleLongPress = useCallback((): void => {
        void setRemoving(group, name, year, !removing);
        navigator?.vibrate?.(LONG_PRESS_VIBRATE_DURATION);
    }, [setRemoving, group, name, year, removing]);

    const empty = !amounts?.length;
    const longPress = useLongPress<HTMLTableCellElement>({
        onClick: handleClick,
        onLongPress: empty ? undefined : handleLongPress,
    });
    const eventHandlers = updating || swipeActive ? {} : longPress;
    return (
        <Table.Td
            className={cx('ValueCell')}
            data-empty={empty}
            data-last={last}
            data-preferred={preferred}
            data-updating={updating}
            data-removing={removing}
            data-full={!!span}
            colSpan={span}
            p={0}
            {...eventHandlers}
        >
            <Center className={cx('data')}>{empty ? '.' : <ValueAmounts group={group} amounts={amounts} />}</Center>
            {loaderVisible && (
                <Loader
                    className={cx('loader')}
                    data-visible={updating}
                    size="sm"
                    onTransitionEnd={handleTransitionEnd}
                />
            )}
        </Table.Td>
    );
}
