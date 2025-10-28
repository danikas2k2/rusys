import React, { useMemo } from 'react';

import { Badge, type MantineColor } from '@mantine/core';

import cx from './ChangeBadge.pcss';

type ChangeBadgePosition = 'left' | 'right' | 'top' | 'top-left' | 'top-right';

interface ChangeBadgeProps {
    change: number | boolean;
    position?: ChangeBadgePosition;
}

export function ChangeBadge({ change, position = 'top' }: ChangeBadgeProps) {
    const state = useMemo((): string => {
        if (change === false) {
            return '';
        }
        if (change === true) {
            return 'updated';
        }
        return change > 0 ? 'positive' : 'negative';
    }, [change]);

    const color = useMemo((): MantineColor => {
        if (change === false) {
            return '';
        }
        if (change === true) {
            return 'yellow';
        }
        return change > 0 ? 'green' : 'red';
    }, [change]);

    const display = useMemo((): string => {
        if (change === false) {
            return '';
        }
        if (change === true) {
            return '﹡';
        }
        return `${(change > 0 && '+') || (change < 0 && '–') || ''}${Math.abs(change)}`;
    }, [change]);

    if (!change) {
        return null;
    }

    return (
        <Badge
            className={cx('ChangeBadge')}
            role="status"
            data-position={position}
            data-state={state}
            variant="filled"
            color={color}
        >
            {display}
        </Badge>
    );
}
