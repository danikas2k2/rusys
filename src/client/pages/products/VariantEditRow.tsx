import { ActionIcon, Flex, Group, NumberInput } from '@mantine/core';
import { IconEdit, IconMinus, IconPlus, IconToolsKitchen2, IconTrash } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useLabels } from '~/client/hooks/useLabels';

import './VariantEditRow.pcss';

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

export function VariantEditRow({ type, delta, minDelta, onChange }: VariantEditRowProps) {
    const _ = useLabels();

    const decrease = useCallback(() => {
        const next = delta - 1;
        if (next >= minDelta) {
            onChange(type, next);
        }
    }, [delta, minDelta, onChange, type]);

    const maxDelta = type === 'updated' ? Infinity : 0;

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
        <Flex className="variant-edit-row" align="center" gap="sm" data-type={type}>
            {ICONS[type]}
            <Group gap="xs" align="center" style={{ marginLeft: 'auto' }}>
                <NumberInput
                    value={delta}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
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
            </Group>
        </Flex>
    );
}
