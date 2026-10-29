import { ActionIcon, Flex, NumberInput, Select, Text, type ComboboxItem } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import React, { useCallback, useMemo, useState } from 'react';

import { DecreaseIcon, IncreaseIcon, RecycledIcon } from '@icons';

import { VariantAvatar } from '~/components/amounts/VariantAvatar';
import { VariantTitle } from '~/components/amounts/VariantTitle';
import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { useFormTracking } from '~/components/common/useUsageTracking';
import { useLabels } from '~/lib/hooks/useLabels';
import { trackFaroEvent } from '~/lib/observability/faro';
import { consumedAmountSchema, type ConsumedAmount, type VariantAmount } from '~/schema';
import { useGroupVariantComparator } from '~/store/variants';

import './MoveConsumedForm.css';

interface MoveConsumedFormProps {
    group: string;
    lines: readonly VariantAmount[];
    onMove: (line: VariantAmount, amount: number) => void;
    disabled?: boolean;
}

export function MoveConsumedForm({ group, lines, onMove, disabled = false }: MoveConsumedFormProps) {
    const usage = useFormTracking('move_consumed');
    const _ = useLabels();
    const compareVariants = useGroupVariantComparator(group);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const form = useForm<ConsumedAmount>({
        initialValues: { amount: 0 },
        validate: schemaResolver(consumedAmountSchema, { sync: true }),
    });
    const amount = form.values.amount;
    const setAmount = form.setFieldValue;

    const sortedLines = useMemo(
        () => lines.toSorted((a, b) => compareVariants(a.variant, b.variant)),
        [lines, compareVariants]
    );

    const line = sortedLines[selectedIndex];
    const max = Math.abs(line?.amount ?? 0);

    const handleSelectChange = useCallback(
        (value: string | null) => {
            trackFaroEvent('form_field_changed', { form: 'move_consumed', field: 'variant' });
            setSelectedIndex(value ? Number(value) : 0);
            setAmount('amount', 0);
        },
        [setAmount]
    );

    const decrease = useCallback(() => setAmount('amount', Math.max(0, amount - 1)), [amount, setAmount]);
    const increase = useCallback(() => setAmount('amount', Math.min(max, amount + 1)), [amount, max, setAmount]);

    const handleChange = useCallback(
        (value: string | number) => {
            const raw = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(raw)) {
                return;
            }
            setAmount('amount', Math.min(max, Math.max(0, raw)));
        },
        [max, setAmount]
    );

    const handleMove = useCallback(
        ({ amount: submittedAmount }: ConsumedAmount) => {
            if (line && submittedAmount <= Math.abs(line.amount) && !disabled) {
                onMove(line, submittedAmount);
                setAmount('amount', 0);
            }
        },
        [line, disabled, onMove, setAmount]
    );

    const data: ComboboxItem[] = useMemo(
        () => sortedLines.map((l, i) => ({ value: String(i), label: l.variant })),
        [sortedLines]
    );

    if (!line) {
        return null;
    }

    return (
        <form
            onSubmitCapture={() => trackFaroEvent('form_submitted', { form: 'move_consumed' })}
            onSubmit={form.onSubmit(handleMove, () =>
                trackFaroEvent('form_validation_failed', { form: 'move_consumed', field: 'amount' })
            )}
        >
            <Flex className="move-consumed-form" align="center" gap="sm" wrap="wrap">
                {sortedLines.length > 1 ? (
                    <Select
                        aria-label={_('Select variant')}
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
                    onBlur={() => usage.field('amount', form.isDirty('amount'))}
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
                        <IconButtonTooltip>
                            <ActionIcon
                                type="button"
                                size="input-xs"
                                color="text"
                                variant="subtle"
                                onClick={amount > 0 && !disabled ? decrease : undefined}
                                aria-label={amount > 0 ? _('Decrease') : undefined}
                            >
                                {amount > 0 ? <DecreaseIcon size={14} /> : undefined}
                            </ActionIcon>
                        </IconButtonTooltip>
                    }
                    rightSection={
                        <IconButtonTooltip>
                            <ActionIcon
                                type="button"
                                size="input-xs"
                                color="text"
                                variant="subtle"
                                onClick={amount < max && !disabled ? increase : undefined}
                                aria-label={amount < max ? _('Increase') : undefined}
                            >
                                {amount < max ? <IncreaseIcon size={14} /> : undefined}
                            </ActionIcon>
                        </IconButtonTooltip>
                    }
                />
                <IconButtonTooltip>
                    <ActionIcon
                        type="submit"
                        size="input-sm"
                        color="negative"
                        variant="subtle"
                        disabled={amount <= 0 || disabled}
                        aria-label={_('Move to discarded')}
                    >
                        <RecycledIcon size={16} />
                    </ActionIcon>
                </IconButtonTooltip>
            </Flex>
        </form>
    );
}
