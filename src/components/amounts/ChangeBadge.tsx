import { Badge, type MantineColor } from '@mantine/core';
import React from 'react';

import './ChangeBadge.css';

type ChangeBadgeType = number | boolean;

type ChangeBadgePosition = 'left' | 'right' | 'top' | 'top-left' | 'top-right' | 'inline';

interface ChangeBadgeProps {
    change: ChangeBadgeType;
    position?: ChangeBadgePosition;
}

/** TODO check if `position` is still used */
export function ChangeBadge({ change, position = 'inline' }: ChangeBadgeProps) {
    const inline = position === 'inline';
    return change ? (
        <Badge
            className={inline ? undefined : 'change-badge'}
            p={2}
            role="status"
            data-position={position}
            data-state={getState(change)}
            color={getColor(change)}
            variant="filled"
        >
            {getDisplay(change)}
        </Badge>
    ) : null;
}

// Only called with a truthy `change` (see the ternary above), so the `false`/`0` case never reaches here.
function getState(change: true | number): string {
    if (change === true) {
        return 'updated';
    }
    return change > 0 ? 'positive' : 'negative';
}

function getColor(change: true | number): MantineColor {
    if (change === true) {
        return 'moderate';
    }
    return change > 0 ? 'positive' : 'negative';
}

function getDisplay(change: true | number): string {
    if (change === true) {
        return '﹡';
    }
    return `${change > 0 ? '+' : '–'}${Math.abs(change)}`;
}
