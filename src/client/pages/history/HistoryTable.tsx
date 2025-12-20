import { Group, Table, Text } from '@mantine/core';
import React, { useMemo } from 'react';

import { GroupTitle } from '~/client/table/GroupTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import type { ProductUpdateHistoryItem, UserProfile } from '~/types/data';
import { AmountsCell } from './components/AmountsCell';
import { EmailAvatar } from './components/EmailAvatar';
import type { HistorySession } from './utils/sessions';
import { formatSessionStartTitle, formatTimeHHmm, minuteKey } from './utils/time';
import { Label } from '~/client/common/Label';

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
            const userKey = (h: ProductUpdateHistoryItem) => (h.user ?? '').toLowerCase();
            const timeKey = (h: ProductUpdateHistoryItem) => minuteKey(h.time); // minute precision
            const nameGroupKey = (h: ProductUpdateHistoryItem) => `${h.name}\n${h.group}`;
            const yearKey = (h: ProductUpdateHistoryItem) => h.year;

            const showIfChanged = <T,>(
                items: readonly ProductUpdateHistoryItem[],
                idx: number,
                k: (h: ProductUpdateHistoryItem) => T
            ) => {
                if (idx === 0) return true;
                return k(items[idx]!) !== k(items[idx - 1]!);
            };

            return (
                <React.Fragment key={`${s.startTime}-${s.endTime}`}>
                    <GroupTitle colSpan={5}>
                        <Group justify="space-between">
                            <Label>{formatSessionStartTitle(s.startTime)}</Label>
                            <Text size="sm" c="dimmed">
                                {s.items.length}
                            </Text>
                        </Group>
                    </GroupTitle>
                    <Table.Tbody>
                        {s.items.map((h, idx) => {
                            const showUser = showIfChanged(s.items, idx, userKey);
                            const showTime = showIfChanged(s.items, idx, timeKey);
                            const showNameGroup = showIfChanged(s.items, idx, nameGroupKey);
                            const showYear = h.year !== 0 && showIfChanged(s.items, idx, yearKey);

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
                                    <Table.Td>
                                        {showUser ? (
                                            <EmailAvatar
                                                email={h.user}
                                                profile={h.user ? profilesByEmail[h.user.toLowerCase()] : undefined}
                                                fallbackPicture={
                                                    h.user && meEmail && h.user.toLowerCase() === meEmail.toLowerCase()
                                                        ? mePicture
                                                        : undefined
                                                }
                                            />
                                        ) : null}
                                    </Table.Td>
                                    <Table.Td>{showTime ? formatTimeHHmm(h.time) : ''}</Table.Td>
                                    <Table.Td>
                                        {showNameGroup ? (
                                            <>
                                                <Text size="sm">{h.name}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {h.group}
                                                </Text>
                                            </>
                                        ) : null}
                                    </Table.Td>
                                    <Table.Td>{showYear ? h.year : ''}</Table.Td>
                                    <Table.Td>
                                        <AmountsCell amounts={h.amounts ?? []} />
                                    </Table.Td>
                                </SwipeableRow>
                            );
                        })}
                    </Table.Tbody>
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
                        <Label>User</Label>
                    </Table.Th>
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


