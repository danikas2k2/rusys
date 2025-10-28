import React, { useCallback, useEffect, useState } from 'react';

import { Center, Loader, Table } from '@mantine/core';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useActiveSwipe } from '~/client/hooks/useActiveSwipe';
import { useLongPress } from '~/client/hooks/useLongPress';
import { useDetailsUpdating } from '~/client/pages/details/UpdatingDetailsContext';
import { ValueAmounts } from '~/client/pages/details/ValueAmounts';
import { useSetDetailsRemoving } from '~/client/state/details/useSetDetailsRemoving';
import type { DetailsAmounts } from '~/types/data';
import cx from './ValueCell.pcss';

export interface ValueCellProps extends DetailsAmounts {
    preferred?: boolean;
    removing?: boolean;
    last?: boolean;
    span?: number;
}

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
    const [, setActive] = useActiveContent<DetailsAmounts>();
    const setRemoving = useSetDetailsRemoving();
    const updating = useDetailsUpdating({ group, name, year: span ? 0 : year });
    const swipeActive = useActiveSwipe();

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

    const handleShortPress = useCallback(() => {
        setActive({ action: 'values', data: { group, name, year: span ? 0 : year, amounts } });
    }, [setActive, group, name, span, year, amounts]);

    // TODO add setRemoving to edit dialog
    const handleLongPress = useCallback((): void => {
        void setRemoving(group, name, year, !removing);
        navigator?.vibrate?.(200);
    }, [setRemoving, group, name, year, removing]);

    const longPress = useLongPress<HTMLTableCellElement>(handleLongPress, handleShortPress);
    const empty = !amounts?.length;
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
            {...(updating || swipeActive
                ? {}
                : empty
                  ? { onClick: handleShortPress, onContextMenu: longPress.onContextMenu }
                  : { ...longPress })}
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
