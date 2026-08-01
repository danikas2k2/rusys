import { Button, Group, Stack, Textarea } from '@mantine/core';
import React from 'react';

import { HomeIcon, SuspiciousIcon } from '@icons';

import { useLabels } from '~/client/hooks/useLabels';
import { AmountVariantRow, type VariantEditType } from '~/client/pages/products/AmountVariantRow';

export interface VariantDelta {
    updated: number;
    consumed: number;
    recycled: number;
}

interface VariantExpandedRowsProps {
    delta: VariantDelta;
    baseAmount: number;
    comment: string;
    onChange: (type: VariantEditType, value: number) => void;
    onCommentChange: (value: string) => void;
    onAddSuspicious?: () => void;
    onAddHome?: () => void;
    children?: React.ReactNode;
}

export function AmountExpanded({
    delta,
    baseAmount,
    comment,
    onChange,
    onCommentChange,
    onAddSuspicious,
    onAddHome,
    children,
}: VariantExpandedRowsProps) {
    const _ = useLabels();
    const minUpdated = -(baseAmount + delta.consumed + delta.recycled);
    const minConsumed = -(baseAmount + delta.updated + delta.recycled);
    const minRecycled = -(baseAmount + delta.updated + delta.consumed);

    return (
        <Stack gap="xs" py="xs">
            <AmountVariantRow type="updated" delta={delta.updated} minDelta={minUpdated} onChange={onChange} />
            <AmountVariantRow type="consumed" delta={delta.consumed} minDelta={minConsumed} onChange={onChange} />
            <AmountVariantRow type="recycled" delta={delta.recycled} minDelta={minRecycled} onChange={onChange} />
            <Textarea
                placeholder={_('Comment')}
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                autosize
                minRows={1}
                maxRows={3}
            />
            {children}
            {(onAddSuspicious || onAddHome) && (
                <Group gap="xs" justify="center" pt="sm">
                    {onAddSuspicious && (
                        <Button
                            variant="light"
                            color="moderate"
                            size="sm"
                            leftSection={<SuspiciousIcon size={14} />}
                            onClick={onAddSuspicious}
                        >
                            {_('Suspicious')}
                        </Button>
                    )}
                    {onAddHome && (
                        <Button
                            variant="light"
                            color="blue"
                            size="sm"
                            leftSection={<HomeIcon size={14} />}
                            onClick={onAddHome}
                        >
                            {_('Home')}
                        </Button>
                    )}
                </Group>
            )}
        </Stack>
    );
}
