import { ActionIcon, Flex, NumberInput } from '@mantine/core';
import React, { useCallback } from 'react';

import { ConsumedIcon, DecreaseIcon, IncreaseIcon, RecycledIcon, UpdatedIcon } from '@icons';

import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { useLabels } from '~/lib/hooks/useLabels';

import './AmountVariantRow.css';

export type VariantEditType = 'updated' | 'consumed' | 'recycled';

interface VariantEditRowProps {
    type: VariantEditType;
    delta: number;
    minDelta: number;
    onChange: (type: VariantEditType, delta: number) => void;
}

const ICONS: Record<VariantEditType, React.ReactNode> = {
    updated: <UpdatedIcon size={18} />,
    consumed: <ConsumedIcon size={18} />,
    recycled: <RecycledIcon size={18} />,
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
                    <IconButtonTooltip>
                        <ActionIcon
                            size="input-xs"
                            color="text"
                            variant="subtle"
                            onClick={canDecrease ? decrease : undefined}
                            aria-label={canDecrease ? _('Decrease') : undefined}
                        >
                            {canDecrease ? <DecreaseIcon size={14} /> : undefined}
                        </ActionIcon>
                    </IconButtonTooltip>
                }
                rightSection={
                    <IconButtonTooltip>
                        <ActionIcon
                            size="input-xs"
                            color="text"
                            variant="subtle"
                            onClick={canIncrease ? increase : undefined}
                            aria-label={canIncrease ? _('Increase') : undefined}
                        >
                            {canIncrease ? <IncreaseIcon size={14} /> : undefined}
                        </ActionIcon>
                    </IconButtonTooltip>
                }
            />
        </Flex>
    );
}
