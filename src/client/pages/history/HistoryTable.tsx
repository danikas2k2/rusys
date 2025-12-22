import { Group, Table, Text } from '@mantine/core';
import React, { useMemo } from 'react';

import { Label } from '~/client/common/Label';
import { GroupTitle } from '~/client/table/GroupTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import type { ProductUpdateHistoryItem, UserProfile } from '~/types/data';
import { AmountsCell } from './components/AmountsCell';
import { EmailAvatar } from './components/EmailAvatar';
import type { HistorySession } from './utils/sessions';
import { formatSessionStartTitle, formatTimeHHmm, minuteKey } from './utils/time';

type ProfilesByEmail = Record<string, UserProfile>;

export function HistoryTable({
    sessions,
    profilesByEmail,
    meEmail,
    mePicture,
    active,
    setActive,
    openEdit,
}: {
    sessions: readonly HistorySession[];
    profilesByEmail: ProfilesByEmail;
    meEmail?: string;
    mePicture?: string;
    active: { id?: string; offset?: number; action?: string } | undefined;
    setActive: () => void;
    openEdit: (item: ProductUpdateHistoryItem) => void;
}): React.ReactElement {
    // stable helpers per render
    const renderSession = useMemo(
        () => (s: HistorySession) => {
            const timeKey = (h: ProductUpdateHistoryItem) => minuteKey(h.time); // minute precision
            const nameGroupKey = (h: ProductUpdateHistoryItem) => `${h.name}\n${h.group}`;
            const yearKey = (h: ProductUpdateHistoryItem) => h.year;
            const runKey = (h: ProductUpdateHistoryItem) => `${timeKey(h)}|${nameGroupKey(h)}|${h.year ?? 0}`;

            const showIfChanged = <T,>(
                items: readonly ProductUpdateHistoryItem[],
                idx: number,
                k: (h: ProductUpdateHistoryItem) => T
            ) => {
                if (idx === 0) return true;
                return k(items[idx]!) !== k(items[idx - 1]!);
            };

            const runs = (() => {
                const out: Array<{ start: number; end: number }> = [];
                let i = 0;
                while (i < s.items.length) {
                    const k = runKey(s.items[i]!);
                    let j = i + 1;
                    while (j < s.items.length && runKey(s.items[j]!) === k) j += 1;
                    out.push({ start: i, end: j });
                    i = j;
                }
                return out;
            })();

            const stickyStyle: React.CSSProperties = {
                position: 'sticky',
                insetBlockStart: '5rem',
                zIndex: 0,
                background: 'var(--mantine-color-body)',
            };

            return (
                <React.Fragment key={`${s.startTime}-${s.endTime}`}>
                    <GroupTitle colSpan={4}>
                        <Group justify="space-between">
                            <Group wrap="nowrap" gap="xs">
                                <EmailAvatar
                                    email={s.items[0]?.user}
                                    profile={
                                        s.items[0]?.user ? profilesByEmail[s.items[0].user.toLowerCase()] : undefined
                                    }
                                    fallbackPicture={
                                        s.items[0]?.user &&
                                        meEmail &&
                                        s.items[0].user.toLowerCase() === meEmail.toLowerCase()
                                            ? mePicture
                                            : undefined
                                    }
                                />
                                <Label>{formatSessionStartTitle(s.startTime)}</Label>
                            </Group>
                        </Group>
                    </GroupTitle>
                    {runs.map(({ start, end }) => {
                        const runItems = s.items.slice(start, end);
                        const stickyEnabled = runItems.length > 1;
                        return (
                            <Table.Tbody key={`${s.startTime}-${start}`}>
                                {runItems.map((h, runIdx) => {
                                    const idx = start + runIdx;
                                    const showTime = showIfChanged(s.items, idx, timeKey);
                                    const showNameGroup = showIfChanged(s.items, idx, nameGroupKey);
                                    const hasYear = h.year !== 0;
                                    const showYear = hasYear && showIfChanged(s.items, idx, yearKey);

                                    const stickyThisRow = stickyEnabled && runIdx === 0;

                                    return (
                                        <SwipeableRow
                                            key={h.id}
                                            id={h.id}
                                            data={h}
                                            data-group={h.group}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                // If this row is currently swiped open, clicking closes it
                                                if (active?.id === h.id && active?.offset && !active?.action) {
                                                    setActive();
                                                    return;
                                                }

                                                setActive();
                                                openEdit(h);
                                            }}
                                        >
                                            <Table.Td style={stickyThisRow && showTime ? stickyStyle : undefined}>
                                                {showTime ? formatTimeHHmm(h.time) : ''}
                                            </Table.Td>
                                            <Table.Td
                                                colSpan={hasYear ? 1 : 2}
                                                style={stickyThisRow && showNameGroup ? stickyStyle : undefined}
                                            >
                                                {showNameGroup ? (
                                                    <>
                                                        <Text size="sm">{h.name}</Text>
                                                        <Text size="xs" c="dimmed">
                                                            {h.group}
                                                        </Text>
                                                    </>
                                                ) : null}
                                            </Table.Td>
                                            {hasYear && (
                                                <Table.Td style={stickyThisRow && showYear ? stickyStyle : undefined}>
                                                    {showYear ? h.year : ''}
                                                </Table.Td>
                                            )}
                                            <Table.Td>
                                                <AmountsCell amounts={h.amounts ?? []} />
                                            </Table.Td>
                                        </SwipeableRow>
                                    );
                                })}
                            </Table.Tbody>
                        );
                    })}
                </React.Fragment>
            );
        },
        [active, meEmail, mePicture, openEdit, profilesByEmail, setActive]
    );

    return (
        <Table layout="fixed" data-table="history">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>
                        <Label>Time</Label>
                    </Table.Th>
                    <Table.Th>
                        <Label>Name</Label>
                    </Table.Th>
                    <Table.Th>
                        <Label>Year</Label>
                    </Table.Th>
                    <Table.Th>
                        <Label>Amounts</Label>
                    </Table.Th>
                </Table.Tr>
            </Table.Thead>
            {sessions.map(renderSession)}
        </Table>
    );
}
