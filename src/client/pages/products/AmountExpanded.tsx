import { Button, Stack, Textarea } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import React from 'react';

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
}

export function AmountExpanded({
    delta,
    baseAmount,
    comment,
    onChange,
    onCommentChange,
    onAddSuspicious,
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
                rows={2}
            />
            {onAddSuspicious && (
                <Button
                    variant="subtle"
                    color="moderate"
                    size="xs"
                    leftSection={<IconAlertTriangle size={14} />}
                    onClick={onAddSuspicious}
                >
                    {_('Something suspicious?')}
                </Button>
            )}
        </Stack>
    );
}
