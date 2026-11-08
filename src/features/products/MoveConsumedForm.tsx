import { ActionIcon, Button, Flex, Group, NumberInput, Select, Text, type ComboboxItem } from '@mantine/core';
import { schemaResolver, useForm } from '@mantine/form';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CancelIcon, DecreaseIcon, IncreaseIcon, RecycledIcon } from '@icons';

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
    onCancel?: () => void;
    onAmountChange?: (amount: number) => void;
}

export function MoveConsumedForm({
    group,
    lines,
    onMove,
    disabled = false,
    onCancel,
    onAmountChange,
}: MoveConsumedFormProps) {
    const usage = useFormTracking('move_consumed');
    const _ = useLabels();
    const compareVariants = useGroupVariantComparator(group);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const form = useForm<ConsumedAmount>({
        initialValues: { amount: 0 },
        validate: schemaResolver(consumedAmountSchema, { sync: true }),
    });
    const amount = form.values.amount;
    const setFieldValue = form.setFieldValue;
    const setAmount = useCallback(
        (value: number) => {
            setFieldValue('amount', value);
            onAmountChange?.(value);
        },
        [setFieldValue, onAmountChange]
    );

    const sortedLines = useMemo(
        () => lines.toSorted((a, b) => compareVariants(a.variant, b.variant)),
        [lines, compareVariants]
    );

    const line = sortedLines[selectedIndex];
    const max = Math.abs(line?.amount ?? 0);

    useEffect(() => {
        if (amount > max) {
            setAmount(max);
        }
    }, [amount, max, setAmount]);

    const handleSelectChange = useCallback(
        (value: string | null) => {
            trackFaroEvent('form_field_changed', { form: 'move_consumed', field: 'variant' });
            setSelectedIndex(value ? Number(value) : 0);
            setAmount(0);
        },
        [setAmount]
    );

    const decrease = useCallback(() => {
        if (amount <= 1) {
            inputRef.current?.focus();
        }
        setAmount(Math.max(0, amount - 1));
    }, [amount, setAmount]);
    const increase = useCallback(() => {
        if (amount + 1 >= max) {
            inputRef.current?.focus();
        }
        setAmount(Math.min(max, amount + 1));
    }, [amount, max, setAmount]);

    const handleChange = useCallback(
        (value: string | number) => {
            const raw = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(raw)) {
                return;
            }
            setAmount(Math.min(max, Math.abs(raw)));
        },
        [max, setAmount]
    );

    const handleMove = useCallback(
        ({ amount: submittedAmount }: ConsumedAmount) => {
            if (line && submittedAmount <= Math.abs(line.amount) && !disabled) {
                onMove(line, submittedAmount);
            }
        },
        [line, disabled, onMove]
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
            data-move-dialog={!!onCancel || undefined}
            onSubmitCapture={() => trackFaroEvent('form_submitted', { form: 'move_consumed' })}
            onSubmit={form.onSubmit(handleMove, () =>
                trackFaroEvent('form_validation_failed', { form: 'move_consumed', field: 'amount' })
            )}
        >
            <Flex
                className="move-consumed-form"
                align="center"
                justify={onCancel ? 'flex-end' : undefined}
                gap="sm"
                wrap="wrap"
            >
                {!onCancel &&
                    (sortedLines.length > 1 ? (
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
                    ))}
                {onCancel && <RecycledIcon size={18} aria-hidden="true" />}
                <NumberInput
                    ref={inputRef}
                    value={amount === 0 ? 0 : -amount}
                    onChange={handleChange}
                    onBlur={() => usage.field('amount', form.isDirty('amount'))}
                    onFocus={(e) => e.target.select()}
                    aria-label={_('Amount')}
                    allowNegative
                    allowDecimal={false}
                    size="sm"
                    hideControls
                    min={-max}
                    max={0}
                    disabled={disabled}
                    leftSection={
                        amount < max && !disabled ? (
                            <IconButtonTooltip>
                                <ActionIcon
                                    type="button"
                                    size="input-xs"
                                    color="text"
                                    variant="subtle"
                                    onClick={increase}
                                    aria-label={_('Decrease')}
                                >
                                    <DecreaseIcon size={14} />
                                </ActionIcon>
                            </IconButtonTooltip>
                        ) : (
                            <span aria-hidden="true" />
                        )
                    }
                    rightSection={
                        amount > 0 && !disabled ? (
                            <IconButtonTooltip>
                                <ActionIcon
                                    type="button"
                                    size="input-xs"
                                    color="text"
                                    variant="subtle"
                                    onClick={decrease}
                                    aria-label={_('Increase')}
                                >
                                    <IncreaseIcon size={14} />
                                </ActionIcon>
                            </IconButtonTooltip>
                        ) : (
                            <span aria-hidden="true" />
                        )
                    }
                />
                {!onCancel && (
                    <div data-move-actions>
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
                    </div>
                )}
            </Flex>
            {onCancel && (
                <Group justify="flex-end" mt="md">
                    <Button
                        type="button"
                        variant="outline"
                        color="neutral"
                        leftSection={<CancelIcon size={18} />}
                        onClick={() => onCancel()}
                        disabled={disabled}
                    >
                        {_('Cancel')}
                    </Button>
                    <Button
                        type="submit"
                        color="negative"
                        disabled={amount <= 0 || disabled}
                        leftSection={<RecycledIcon size={16} />}
                    >
                        {_('Recycle')}
                    </Button>
                </Group>
            )}
        </form>
    );
}
