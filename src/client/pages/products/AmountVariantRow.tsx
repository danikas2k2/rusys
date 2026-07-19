import { ActionIcon, Flex, NumberInput } from '@mantine/core';
import { IconEdit, IconMinus, IconPlus, IconToolsKitchen2, IconTrash } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useLabels } from '~/client/hooks/useLabels';

import './AmountVariantRow.pcss';

export type VariantEditType = 'updated' | 'consumed' | 'recycled';

interface VariantEditRowProps {
    type: VariantEditType;
    delta: number;
    minDelta: number;
    onChange: (type: VariantEditType, delta: number) => void;
}

const ICONS: Record<VariantEditType, React.ReactNode> = {
    updated: <IconEdit size={18} />,
    consumed: <IconToolsKitchen2 size={18} />,
    recycled: <IconTrash size={18} />,
};

export function AmountVariantRow({ type, delta, minDelta, onChange }: VariantEditRowProps) {
    const _ = useLabels();
    const isUpdated = type === 'updated';

    const decrease = useCallback(() => {
        const next = delta - 1;
        if (next >= minDelta) {
            onChange(type, next);
        }
    }, [delta, minDelta, onChange, type]);

    const maxDelta = isUpdated ? Infinity : 0;

    const increase = useCallback(() => {
        const next = delta + 1;
        if (next <= maxDelta) {
            onChange(type, next);
        }
    }, [delta, maxDelta, onChange, type]);

    const handleChange = useCallback(
        (value: string | number) => {
            const raw = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(raw)) {
                return;
            }
            const signed = type === 'updated' ? raw : -Math.abs(raw);
            const clamped = Math.min(maxDelta, Math.max(minDelta, signed));
            onChange(type, clamped);
        },
        [maxDelta, minDelta, onChange, type]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === 'ArrowUp') {
                increase();
            }
            if (e.key === 'ArrowDown') {
                decrease();
            }
        },
        [decrease, increase]
    );

    const canDecrease = delta > minDelta;
    const canIncrease = delta < maxDelta;

    return (
        <Flex className="variant-edit-row" align="center" justify="end" gap="sm" data-type={type}>
            {!isUpdated && ICONS[type]}
            <NumberInput
                value={delta}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                aria-label={type}
                allowNegative
                allowDecimal={false}
                size="sm"
                hideControls
                leftSection={
                    <ActionIcon
                        size="input-xs"
                        color="text"
                        variant="subtle"
                        onClick={canDecrease ? decrease : undefined}
                        aria-label={canDecrease ? _('Decrease') : undefined}
                    >
                        {canDecrease ? <IconMinus size={14} /> : undefined}
                    </ActionIcon>
                }
                rightSection={
                    <ActionIcon
                        size="input-xs"
                        color="text"
                        variant="subtle"
                        onClick={canIncrease ? increase : undefined}
                        aria-label={canIncrease ? _('Increase') : undefined}
                    >
                        {canIncrease ? <IconPlus size={14} /> : undefined}
                    </ActionIcon>
                }
            />
        </Flex>
    );
}
