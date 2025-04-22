import React from 'react';
import ChartIcon from '@assets/chart.svg';
import { Label } from '~/client/common/Label';
import { Links } from '~/client/Links';
import { LinkMenuItem, type LinkMenuItemProps } from '~/client/toolbar/items/LinkMenuItem';

export function SummaryItem({ current }: Pick<LinkMenuItemProps, 'current'>) {
    return (
        <LinkMenuItem link={Links.SUMMARY} icon={<ChartIcon />} color="primary" current={current}>
            <Label>Statistics</Label>
        </LinkMenuItem>
    );
}
