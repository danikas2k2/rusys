import { Group, Stack, Text, ThemeIcon, VisuallyHidden } from '@mantine/core';
import React from 'react';

import { ConsumedIcon, HomeIcon, RecycledIcon, SuspiciousIcon, UpdatedIcon } from '@icons';

import { VariantTitle } from '~/components/amounts/VariantTitle';
import type { VariantAmount } from '~/schema';
import { useGroupVariantComparator } from '~/store/variants';

function amountIdentity(amount: VariantAmount): string {
    return JSON.stringify([
        amount.variant,
        amount.recycled ?? null,
        amount.suspicious ?? null,
        amount.home ?? null,
        amount.expiresAt ?? null,
    ]);
}

export function AmountsCell({
    group = '',
    amounts,
    onSelect,
    actionLabel,
    isExpanded,
    renderDetails,
    renderRow,
    getDisplayAmount,
    disabled = false,
}: {
    group?: string;
    amounts: readonly VariantAmount[];
    onSelect?: (amount: VariantAmount, trigger: HTMLButtonElement, key: string) => void;
    actionLabel?: string;
    isExpanded?: (amount: VariantAmount, key: string) => boolean;
    renderDetails?: (amount: VariantAmount, key: string) => React.ReactNode;
    renderRow?: (content: React.ReactNode, index: number, expanded: boolean, last: boolean) => React.ReactNode;
    getDisplayAmount?: (amount: VariantAmount, key: string) => number;
    disabled?: boolean;
}): React.ReactElement {
    const comparator = useGroupVariantComparator(group);
    if (!amounts.length) {
        return (
            <Text size="sm" c="dimmed">
                —
            </Text>
        );
    }
    const sorted = amounts.toSorted(
        (a, b) =>
            comparator(a.variant, b.variant) ||
            (!!a.suspicious === !!b.suspicious && !!a.home === !!b.home ? 0 : a.suspicious || a.home ? 1 : -1)
    );
    const rows = sorted.map((a, index) => {
        const isUpdated = a.recycled == null;
        const typeLabel = isUpdated ? 'Updated' : a.recycled ? 'Recycled' : 'Consumed';
        const color = isUpdated ? 'blue' : a.recycled ? 'negative' : 'positive';
        const Icon = isUpdated ? UpdatedIcon : a.recycled ? RecycledIcon : ConsumedIcon;
        const identity = amountIdentity(a);
        const key = `${identity}:${sorted.slice(0, index).filter((item) => amountIdentity(item) === identity).length}`;
        const labelColor = a.suspicious ? 'moderate' : a.home ? 'blue' : undefined;
        const selectable = onSelect && a.recycled === false && a.amount < 0;
        const active = isExpanded?.(a, key) ?? false;
        const displayAmount = getDisplayAmount?.(a, key) ?? a.amount;
        const content = (
            <Group justify="space-between" wrap="nowrap" gap="xs">
                <Group wrap="nowrap" gap="xs">
                    <ThemeIcon size="sm" variant="light" color={color} title={typeLabel} aria-label={typeLabel}>
                        <Icon size={14} />
                    </ThemeIcon>
                    <Text size="sm" c={labelColor}>
                        <VariantTitle group={group} variant={a.variant} />
                        {a.suspicious && (
                            <ThemeIcon size="xs" variant="transparent" color="moderate" display="inline-flex" ms={4}>
                                <SuspiciousIcon size={12} />
                            </ThemeIcon>
                        )}
                        {a.home && (
                            <ThemeIcon size="xs" variant="transparent" color="blue" display="inline-flex" ms={4}>
                                <HomeIcon size={12} />
                            </ThemeIcon>
                        )}
                    </Text>
                </Group>
                <Text
                    size="sm"
                    fw={500}
                    c={displayAmount > 0 ? 'positive' : displayAmount < 0 ? 'negative' : undefined}
                >
                    {displayAmount > 0 ? `+${displayAmount}` : displayAmount < 0 ? `−${Math.abs(displayAmount)}` : '0'}
                </Text>
            </Group>
        );
        const row = (
            <div key={key} data-history-amount-line data-expanded={active || undefined}>
                {selectable ? (
                    <button
                        type="button"
                        disabled={disabled}
                        data-history-consumed
                        data-history-key={key}
                        onClick={(event) => onSelect(a, event.currentTarget, key)}
                        aria-expanded={active}
                    >
                        <VisuallyHidden>{actionLabel}: </VisuallyHidden>
                        {content}
                    </button>
                ) : (
                    content
                )}
                {renderDetails?.(a, key)}
            </div>
        );
        return renderRow ? (
            <React.Fragment key={key}>{renderRow(row, index, active, index === sorted.length - 1)}</React.Fragment>
        ) : (
            row
        );
    });
    return renderRow ? <>{rows}</> : <Stack gap={4}>{rows}</Stack>;
}
