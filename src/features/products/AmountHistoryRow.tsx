import { Group, Stack, Table, Text, VisuallyHidden } from '@mantine/core';
import React, { startTransition, useCallback, useId, useLayoutEffect, useRef, useState, ViewTransition } from 'react';

import { AmountsCell } from '~/components/amounts/AmountsCell';
import { EmailAvatar } from '~/components/common/EmailAvatar';
import { FormatDate } from '~/components/common/FormatDate';
import { Label } from '~/components/common/Label';
import { RecycleRefreshError } from '~/features/products/hooks/RecycleRefreshError';
import { useMoveConsumedToRecycled } from '~/features/products/hooks/useMoveConsumedToRecycled';
import { MoveConsumedForm } from '~/features/products/MoveConsumedForm';
import { useLabels } from '~/lib/hooks/useLabels';
import { getRoundedDate } from '~/lib/utils/time';
import type { History, VariantAmount } from '~/schema';

export function AmountHistoryRow({
    h,
    dimmed = false,
    onMoved,
    expandedEntry,
    setExpandedEntry,
    savingEntry,
    setSavingEntry,
    onRefreshFailure,
}: {
    h: History;
    dimmed?: boolean;
    onMoved?: () => void | Promise<void>;
    expandedEntry?: string | null;
    setExpandedEntry?: React.Dispatch<React.SetStateAction<string | null>>;
    savingEntry?: string | null;
    setSavingEntry?: React.Dispatch<React.SetStateAction<string | null>>;
    onRefreshFailure?: () => void;
}) {
    const _ = useLabels();
    const entryId = useId();
    const moveConsumedToRecycled = useMoveConsumedToRecycled();
    const [localExpanded, setLocalExpanded] = useState<string | null>(null);
    const expanded = setExpandedEntry && expandedEntry !== entryId ? null : localExpanded;
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const [refreshFailed, setRefreshFailed] = useState(false);
    const [previewAmount, setPreviewAmount] = useState(0);
    const cellRef = useRef<HTMLTableCellElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const focusKeyRef = useRef<string | null>(null);

    useLayoutEffect(() => {
        if (focusKeyRef.current === null) {
            return;
        }
        const button = Array.from(
            cellRef.current?.closest('table')?.querySelectorAll<HTMLButtonElement>('[data-history-key]') ?? []
        ).find(
            (item) =>
                item.dataset.historyKey === focusKeyRef.current && item.closest('tr')?.dataset.historyOwner === entryId
        );
        button?.focus();
        focusKeyRef.current = null;
    }, [expanded, entryId]);

    useLayoutEffect(() => {
        if (saving) {
            statusRef.current?.focus();
        } else if (error) {
            statusRef.current?.closest('[data-history-amount-line]')?.querySelector<HTMLInputElement>('input')?.focus();
        }
    }, [saving, error]);
    const handleMove = useCallback(
        async (line: VariantAmount, amount: number) => {
            setSaving(true);
            setSavingEntry?.(entryId);
            setError(false);
            const table = cellRef.current?.closest('table');
            let committed = false;
            let stale = false;
            try {
                await moveConsumedToRecycled({
                    group: h.group,
                    name: h.name,
                    year: h.year ?? 0,
                    sourceSessionId: h.sessionId ?? `${(h.user ?? '').toLowerCase()}:${h.time}`,
                    variant: line.variant,
                    amount,
                    flags: {
                        suspicious: line.suspicious,
                        home: line.home,
                        expiresAt: line.expiresAt,
                    },
                });
                committed = true;
                setPreviewAmount(0);
                startTransition(() => {
                    setLocalExpanded(null);
                    setExpandedEntry?.((current) => (current === entryId ? null : current));
                });
                await onMoved?.();
                table?.focus();
            } catch (err) {
                if (committed || err instanceof RecycleRefreshError) {
                    stale = true;
                    setLocalExpanded(null);
                    setExpandedEntry?.((current) => (current === entryId ? null : current));
                    setRefreshFailed(true);
                    onRefreshFailure?.();
                    table?.focus();
                } else {
                    setError(true);
                }
            } finally {
                setSaving(false);
                if (!stale) {
                    // A committed mutation with a failed refresh must not be repeated from stale history.
                    setSavingEntry?.(null);
                }
            }
        },
        [
            h.group,
            h.name,
            h.year,
            h.sessionId,
            h.user,
            h.time,
            moveConsumedToRecycled,
            onMoved,
            setExpandedEntry,
            setSavingEntry,
            onRefreshFailure,
            entryId,
        ]
    );

    const dateCell = (
        <Table.Td ref={cellRef} data-history-date>
            <Stack gap={2}>
                <Group wrap="nowrap" gap="xs">
                    <EmailAvatar email={h.user} />
                    <Text size="sm" c={dimmed ? 'dimmed' : undefined}>
                        <FormatDate date={getRoundedDate(h.time)} />
                    </Text>
                </Group>
                {refreshFailed && (
                    <Text role="alert" c="red">
                        <Label>Recycled, but refresh failed. Reload the page.</Label>
                    </Text>
                )}
            </Stack>
        </Table.Td>
    );
    const comment = (
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
            {h.comment}
        </Text>
    );
    const hiddenDate = (
        <VisuallyHidden>
            {h.user} <FormatDate date={getRoundedDate(h.time)} />
        </VisuallyHidden>
    );

    if (!h.amounts?.length) {
        return (
            <Table.Tr opacity={dimmed ? 0.4 : undefined}>
                {dateCell}
                <Table.Td>
                    <AmountsCell amounts={[]} />
                    {comment}
                </Table.Td>
            </Table.Tr>
        );
    }

    return (
        <ViewTransition update="amount-variant-update" default="none">
            <AmountsCell
                group={h.group}
                amounts={h.amounts}
                disabled={saving || refreshFailed || Boolean(savingEntry)}
                actionLabel={_('Move to discarded')}
                onSelect={
                    dimmed
                        ? undefined
                        : (_line, _trigger, key) => {
                              setError(false);
                              setPreviewAmount(0);
                              focusKeyRef.current = key;
                              startTransition(() => {
                                  const next = expanded === key ? null : key;
                                  setLocalExpanded(next);
                                  setExpandedEntry?.(next === null ? null : entryId);
                              });
                          }
                }
                isExpanded={(_line, key) => expanded === key}
                getDisplayAmount={(line, key) =>
                    expanded === key ? Math.min(0, line.amount + previewAmount) : line.amount
                }
                renderRow={(content, index, active, last) => (
                    <>
                        {index === 0 && active && (
                            <Table.Tr data-history-entry data-history-continues opacity={dimmed ? 0.4 : undefined}>
                                {dateCell}
                                <Table.Td />
                            </Table.Tr>
                        )}
                        <Table.Tr
                            data-history-entry
                            data-history-continues={!last || undefined}
                            data-history-owner={entryId}
                            opacity={dimmed ? 0.4 : undefined}
                        >
                            {index === 0 && !active ? dateCell : !active ? <Table.Td>{hiddenDate}</Table.Td> : null}
                            <Table.Td colSpan={active ? 2 : undefined} data-history-amounts>
                                {active && hiddenDate}
                                {content}
                                {last && comment}
                            </Table.Td>
                        </Table.Tr>
                    </>
                )}
                renderDetails={(line, key) =>
                    expanded === key && (
                        <div data-history-edit>
                            <VisuallyHidden aria-live="polite" aria-atomic="true">
                                {_('Remaining after recycling')}: {Math.min(0, line.amount + previewAmount)}
                            </VisuallyHidden>
                            <div ref={statusRef} role="status" aria-live="polite" tabIndex={-1}>
                                {saving && (
                                    <>
                                        <Label>Update</Label>…
                                    </>
                                )}
                            </div>
                            <MoveConsumedForm
                                group={h.group}
                                lines={[line]}
                                onMove={handleMove}
                                disabled={saving}
                                onAmountChange={setPreviewAmount}
                                onCancel={() => {
                                    focusKeyRef.current = key;
                                    setPreviewAmount(0);
                                    startTransition(() => {
                                        setLocalExpanded(null);
                                        setExpandedEntry?.((current) => (current === entryId ? null : current));
                                    });
                                }}
                            />
                            {error && (
                                <Text role="alert" c="red">
                                    <Label>Something went wrong</Label>
                                </Text>
                            )}
                        </div>
                    )
                }
            />
        </ViewTransition>
    );
}
