import { Stack, Textarea } from '@mantine/core';
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
}

export function AmountExpanded({ delta, baseAmount, comment, onChange, onCommentChange }: VariantExpandedRowsProps) {
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
        </Stack>
    );
}
