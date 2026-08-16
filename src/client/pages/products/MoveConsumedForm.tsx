import { ActionIcon, Flex, NumberInput, Select, Text, type ComboboxItem } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { DecreaseIcon, IncreaseIcon, RecycledIcon } from '@icons';

import { VariantAvatar } from '~/client/common/VariantAvatar';
import { VariantTitle } from '~/client/common/VariantTitle';
import { useLabels } from '~/client/hooks/useLabels';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import type { VariantAmount } from '~/types/data';

import './MoveConsumedForm.pcss';

interface MoveConsumedFormProps {
    group: string;
    lines: readonly VariantAmount[];
    onMove: (line: VariantAmount, amount: number) => void;
    disabled?: boolean;
}

export function MoveConsumedForm({ group, lines, onMove, disabled = false }: MoveConsumedFormProps) {
    const _ = useLabels();
    const compareVariants = useGroupVariantComparator(group);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [amount, setAmount] = useState(0);

    const sortedLines = useMemo(
        () => [...lines].sort((a, b) => compareVariants(a.variant, b.variant)),
        [lines, compareVariants]
    );

    const line = sortedLines[selectedIndex];
    const max = Math.abs(line?.amount ?? 0);

    const handleSelectChange = useCallback((value: string | null) => {
        setSelectedIndex(value ? Number(value) : 0);
        setAmount(0);
    }, []);

    const decrease = useCallback(() => setAmount((a) => Math.max(0, a - 1)), []);
    const increase = useCallback(() => setAmount((a) => Math.min(max, a + 1)), [max]);

    const handleChange = useCallback(
        (value: string | number) => {
            const raw = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(raw)) {
                return;
            }
            setAmount(Math.min(max, Math.max(0, raw)));
        },
        [max]
    );

    // Only ever wired to onClick while `line` is defined (see the `!line` early return above)
    // and amount > 0 (the button is disabled otherwise).
    const handleMove = useCallback(() => {
        onMove(line!, amount);
        setAmount(0);
    }, [line, amount, onMove]);

    const data: ComboboxItem[] = useMemo(
        () => sortedLines.map((l, i) => ({ value: String(i), label: l.variant })),
        [sortedLines]
    );

    if (!line) {
        return null;
    }

    return (
        <Flex className="move-consumed-form" align="center" gap="sm" wrap="wrap">
            {sortedLines.length > 1 ? (
                <Select
                    data={data}
                    value={String(selectedIndex)}
                    onChange={handleSelectChange}
                    renderOption={({ option }: { option: ComboboxItem }) => (
                        <Flex align="center" gap={6}>
                            <VariantAvatar group={group} variant={option.label} />
                            <VariantTitle group={group} variant={option.label} />
                        </Flex>
                    )}
                    allowDeselect={false}
                    size="sm"
                    withScrollArea={false}
                    comboboxProps={{ middlewares: { flip: false, shift: false } }}
                    style={{ flex: 1 }}
                    disabled={disabled}
                />
            ) : (
                <Text size="sm" fw={500} style={{ flex: 1 }}>
                    <VariantTitle group={group} variant={line.variant} />
                </Text>
            )}
            <NumberInput
                value={amount}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                aria-label="amount"
                allowNegative={false}
                allowDecimal={false}
                size="sm"
                hideControls
                min={0}
                max={max}
                disabled={disabled}
                style={{ width: 120 }}
                leftSection={
                    <ActionIcon
                        size="input-xs"
                        color="text"
                        variant="subtle"
                        onClick={amount > 0 && !disabled ? decrease : undefined}
                        aria-label={amount > 0 ? _('Decrease') : undefined}
                    >
                        {amount > 0 ? <DecreaseIcon size={14} /> : undefined}
                    </ActionIcon>
                }
                rightSection={
                    <ActionIcon
                        size="input-xs"
                        color="text"
                        variant="subtle"
                        onClick={amount < max && !disabled ? increase : undefined}
                        aria-label={amount < max ? _('Increase') : undefined}
                    >
                        {amount < max ? <IncreaseIcon size={14} /> : undefined}
                    </ActionIcon>
                }
            />
            <ActionIcon
                size="input-sm"
                color="negative"
                variant="subtle"
                onClick={handleMove}
                disabled={amount <= 0 || disabled}
                aria-label={_('Move to discarded')}
            >
                <RecycledIcon size={16} />
            </ActionIcon>
        </Flex>
    );
}
