import React from 'react';

import { Badge, type MantineColor } from '@mantine/core';

import './ChangeBadge.pcss';

type ChangeBadgeType = number | boolean;

type ChangeBadgePosition = 'left' | 'right' | 'top' | 'top-left' | 'top-right';

interface ChangeBadgeProps {
    change: ChangeBadgeType;
    position?: ChangeBadgePosition;
}

export function ChangeBadge({ change, position = 'top' }: ChangeBadgeProps) {
    return change ? (
        <Badge
            className="change-badge"
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

function getState(change: ChangeBadgeType): string {
    if (change === false) {
        return '';
    }
    if (change === true) {
        return 'updated';
    }
    return change > 0 ? 'positive' : 'negative';
}

function getColor(change: ChangeBadgeType): MantineColor {
    if (change === false) {
        return '';
    }
    if (change === true) {
        return 'yellow';
    }
    return change > 0 ? 'green' : 'red';
}

function getDisplay(change: ChangeBadgeType): string {
    if (change === false) {
        return '';
    }
    if (change === true) {
        return '﹡';
    }
    return `${(change > 0 && '+') || (change < 0 && '–') || ''}${Math.abs(change)}`;
}
