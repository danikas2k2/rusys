import { Alert, Avatar, Button, Group, Modal, Stack, Table, Text, Textarea, TextInput, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconRobotFace, IconToolsKitchen2, IconTrash } from '@tabler/icons-react';
import md5 from 'blueimp-md5';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { SwipePanel } from '~/client/common/SwipePanel';
import { GroupFilterWrapper, useGroupFilter } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper, useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useYearFilter, YearFilterWrapper } from '~/client/filters/YearFilterContext';
import { Page } from '~/client/pages/common/Page';
import { useApiRequest } from '~/client/state/common/useApiRequest';
import { DEV_MODE_EMAIL } from '~/client/state/profile/dev';
import { useProfile } from '~/client/state/profile/useProfile';
import { GroupTitle } from '~/client/table/GroupTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { ToolbarYearFilter } from '~/client/toolbar/ToolbarYearFilter';
import { getErrorMessage } from '~/client/utils/errors';
import { ApiUrl, type ApiResult } from '~/types/api';
import type { ProductUpdateHistoryItem, UserProfile, VariantAmount } from '~/types/data';

type HistoryResponse = ApiResult<{ history: readonly ProductUpdateHistoryItem[] }>;

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

function AmountsCell({ amounts }: { amounts: readonly VariantAmount[] }): React.ReactElement {
    if (!amounts.length) {
        return (
            <Text size="sm" c="dimmed">
                —
            </Text>
        );
    }

    const sorted = [...amounts].sort((a, b) => a.variant.localeCompare(b.variant));

    return (
        <Stack gap={4}>
            {sorted.map((a) => {
                const recycled = !!a.recycled;
                const typeLabel = recycled ? 'Recycled' : 'Consumed';
                const color = recycled ? 'red' : 'green';
                const Icon = recycled ? IconTrash : IconToolsKitchen2;

                return (
                    <Group
                        key={`${a.variant}-${a.amount}-${recycled ? 'r' : 'c'}`}
                        justify="space-between"
                        wrap="nowrap"
                        gap="xs"
                    >
                        <Group wrap="nowrap" gap="xs">
                            <ThemeIcon size="sm" variant="light" color={color} title={typeLabel} aria-label={typeLabel}>
                                <Icon size={14} />
                            </ThemeIcon>
                            <Text size="sm">{a.variant}</Text>
                        </Group>
                        <Text size="sm" fw={500}>
                            {a.amount > 0 ? `+${a.amount}` : a.amount < 0 ? `−${Math.abs(a.amount)}` : '0'}
                        </Text>
                    </Group>
                );
            })}
        </Stack>
    );
}

function formatTime(time: number): string {
    return new Date(time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

const SESSION_GAP_MS = 15 * 60 * 1000;

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeekMonday(d: Date): Date {
    // JS: Sunday=0 ... Saturday=6; we want Monday as first day of week
    const day = d.getDay();
    const diff = (day + 6) % 7; // Monday->0, Sunday->6
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
    return start;
}

function capitalizeLt(s: string): string {
    if (!s) return s;
    return s[0]!.toUpperCase() + s.slice(1);
}

function roundDownToQuarterHour(time: number): number {
    const d = new Date(time);
    d.setSeconds(0, 0);
    const m = d.getMinutes();
    d.setMinutes(Math.floor(m / 15) * 15);
    return d.getTime();
}

function formatSessionStartTitle(startTime: number): string {
    const rounded = new Date(roundDownToQuarterHour(startTime));
    const now = new Date();

    const today = startOfDay(now);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = startOfWeekMonday(now);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const timeStr = rounded.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });

    if (isSameDay(rounded, today)) {
        return timeStr; // today: omit date completely
    }
    if (isSameDay(rounded, yesterday)) {
        return `Vakar ${timeStr}`;
    }
    if (rounded >= weekStart && rounded < nextWeekStart) {
        const weekday = capitalizeLt(rounded.toLocaleDateString('lt-LT', { weekday: 'long' }));
        return `${weekday} ${timeStr}`;
    }

    const monthDay = capitalizeLt(rounded.toLocaleDateString('lt-LT', { month: 'long', day: 'numeric' }));
    return `${monthDay} ${timeStr}`;
}

type HistorySession = {
    startTime: number;
    endTime: number;
    items: readonly ProductUpdateHistoryItem[];
};

function buildSessions(items: readonly ProductUpdateHistoryItem[], gapMs: number): readonly HistorySession[] {
    if (!items.length) {
        return [];
    }

    const sorted = [...items].sort((a, b) => a.time - b.time); // ascending
    const sessions: ProductUpdateHistoryItem[][] = [];

    let current: ProductUpdateHistoryItem[] = [];
    let prevTime = 0;

    for (const item of sorted) {
        if (!current.length) {
            current = [item];
            prevTime = item.time;
            continue;
        }

        const gap = item.time - prevTime;
        if (gap <= gapMs) {
            current.push(item);
            prevTime = item.time;
            continue;
        }

        sessions.push(current);
        current = [item];
        prevTime = item.time;
    }

    if (current.length) {
        sessions.push(current);
    }

    return sessions
        .map((s) => {
            const startTime = s[0]!.time;
            const endTime = s[s.length - 1]!.time;
            // Render latest first inside the session (same UX as existing history table)
            const displayItems = [...s].sort((a, b) => b.time - a.time);
            return { startTime, endTime, items: displayItems } satisfies HistorySession;
        })
        .sort((a, b) => b.startTime - a.startTime); // newest sessions first
}

function gravatarUrl(email: string, size = 64): string {
    const normalized = email.trim().toLowerCase();
    const hash = md5(normalized);
    // identicon ensures we always get a real image even if no gravatar is set
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

function EmailAvatar({
    email,
    profile,
    fallbackPicture,
}: {
    email?: string;
    profile?: UserProfile;
    fallbackPicture?: string;
}): React.ReactElement | null {
    if (!email) {
        return null;
    }

    const initials = email
        .split('@', 1)[0]
        .split(/[.\-_ ]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join('');

    if (email.toLowerCase() === DEV_MODE_EMAIL.toLowerCase()) {
        return (
            <Avatar color="cyan.9" variant="outline" radius="50%" size="sm" data-robot="true">
                <IconRobotFace size="60%" />
            </Avatar>
        );
    }

    const src = profile?.picture || fallbackPicture || gravatarUrl(email);

    if (src) {
        // If the image fails to load (CSP/network), Mantine will render children as fallback.
        return (
            <Avatar radius="50%" size="sm" src={src} alt={profile?.name ?? email} title={email} aria-label={email}>
                {initials || email[0]!.toUpperCase()}
            </Avatar>
        );
    }

    return (
        <Avatar radius="50%" size="sm" aria-label={email} title={email}>
            {initials || email[0]!.toUpperCase()}
        </Avatar>
    );
}

function HistorySwipeControls(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductUpdateHistoryItem>();

    const handleDelete = useCallback(() => {
        if (!active?.data) {
            return;
        }
        setActive({ ...active, action: 'remove' });
    }, [active, setActive]);

    return (
        <SwipePanel>
            <Button variant="filled" color="red" size="sm" leftSection={<IconTrash size={18} />} onClick={handleDelete}>
                <Label>Remove</Label>
            </Button>
        </SwipePanel>
    );
}

function HistoryContent({ setReload }: { setReload?: React.Dispatch<React.SetStateAction<() => Promise<void>>> }) {
    const request = useApiRequest();
    const [groupFilter] = useGroupFilter();
    const [quickFilter] = useQuickFilter();
    const [active, setActive] = useActiveContent<ProductUpdateHistoryItem>();
    const [year] = useYearFilter();
    const me = useProfile();

    const [history, setHistory] = useState<readonly ProductUpdateHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profilesByEmail, setProfilesByEmail] = useState<Record<string, UserProfile>>({});

    const [selected, setSelected] = useState<ProductUpdateHistoryItem | null>(null);
    const [editOpened, editModal] = useDisclosure(false);

    const [editUser, setEditUser] = useState('');
    const [editJson, setEditJson] = useState('[]');
    const [editError, setEditError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await request<HistoryResponse>(ApiUrl.ProductsHistory, {
                year,
            });
            assertOk(result);
            setHistory(result.history);
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [request, year]);

    const loadProfiles = useCallback(
        async (emails: readonly string[]) => {
            const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
            if (!unique.length) {
                setProfilesByEmail({});
                return;
            }

            try {
                const result = await request<ApiResult<{ profiles: readonly UserProfile[] }>>(ApiUrl.UserProfiles, {
                    emails: unique,
                });
                assertOk(result);
                const next: Record<string, UserProfile> = {};
                for (const p of result.profiles ?? []) {
                    if (p.email) {
                        next[p.email.toLowerCase()] = p;
                    }
                }
                setProfilesByEmail(next);
            } catch {
                // If profiles endpoint is unavailable, just fall back to initials/robot
                setProfilesByEmail({});
            }
        },
        [request]
    );

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const emails = history.map((h) => h.user ?? '').filter(Boolean);
        void loadProfiles(emails);
    }, [history, loadProfiles]);

    useEffect(() => {
        setReload?.(() => load);
    }, [load, setReload]);

    const openEdit = useCallback(
        (item: ProductUpdateHistoryItem) => {
            setSelected(item);
            setEditUser(item.user ?? '');
            setEditJson(JSON.stringify(item.amounts ?? [], null, 2));
            setEditError(null);
            editModal.open();
        },
        [editModal]
    );

    const closeEdit = useCallback(() => {
        editModal.close();
        setSelected(null);
        setEditError(null);
    }, [editModal]);

    const submitEdit = useCallback(async () => {
        if (!selected) {
            return;
        }
        setEditError(null);
        try {
            let parsed: unknown;
            try {
                parsed = JSON.parse(editJson);
            } catch {
                throw new Error('Invalid JSON');
            }
            if (!Array.isArray(parsed)) {
                throw new Error('Amounts must be an array');
            }
            const amounts: VariantAmount[] = parsed.map((a) => {
                if (!a || typeof a !== 'object') {
                    throw new Error('Each amount must be an object');
                }
                const variant = (a as VariantAmount).variant;
                const amount = (a as VariantAmount).amount;
                const recycled = (a as VariantAmount).recycled;
                if (!variant || typeof variant !== 'string') {
                    throw new Error('variant is required');
                }
                if (typeof amount !== 'number' || Number.isNaN(amount)) {
                    throw new Error('amount must be a number');
                }
                return recycled != null ? { variant, amount, recycled: !!recycled } : { variant, amount };
            });

            const result = await request<ApiResult>(
                ApiUrl.ProductsHistoryUpdate,
                {
                    group: selected.group,
                    name: selected.name,
                    time: selected.time,
                    year: selected.year,
                    amounts,
                    user: editUser?.trim() || undefined,
                },
                'POST'
            );
            assertOk(result as ApiResult<object>);
            await load();
            closeEdit();
        } catch (e) {
            setEditError(getErrorMessage(e));
        }
    }, [closeEdit, editJson, editUser, load, request, selected]);

    const filtered = useMemo(() => {
        const gf = (groupFilter ?? '').trim().toLowerCase();
        const qf = (quickFilter ?? '').trim().toLowerCase();
        return history.filter((h) => {
            if (gf && h.group.toLowerCase() !== gf) {
                return false;
            }
            if (qf && !h.name.toLowerCase().includes(qf)) {
                return false;
            }
            return true;
        });
    }, [groupFilter, history, quickFilter]);

    const sessions = useMemo(() => {
        const allSessions = buildSessions(filtered, SESSION_GAP_MS);
        // Filtering is evaluated by session start time (first entry in the session).
        return allSessions.filter((s) => new Date(s.startTime).getFullYear() === year);
    }, [filtered, year]);

    return (
        <>
            {error && (
                <Alert variant="light" color="red" icon={<IconAlertCircle size={18} />} mb="sm">
                    {error}
                </Alert>
            )}

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
                {sessions.map((s) => (
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
                            {(() => {
                                const userKey = (h: ProductUpdateHistoryItem) => (h.user ?? '').toLowerCase();
                                const timeKey = (h: ProductUpdateHistoryItem) => Math.floor(h.time / 60000); // minute precision
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

                                return s.items.map((h, idx) => {
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
                                                // If this row is currently swiped open, clicking closes it (same UX as other tables)
                                                if (active?.id === h.id && active?.offset && !active?.action) {
                                                    setActive();
                                                    return;
                                                }

                                                // Otherwise, ensure any swipe panel closes, then open edit
                                                setActive();
                                                openEdit(h);
                                            }}
                                        >
                                            <Table.Td>
                                                {showUser ? (
                                                    <EmailAvatar
                                                        email={h.user}
                                                        profile={
                                                            h.user ? profilesByEmail[h.user.toLowerCase()] : undefined
                                                        }
                                                        fallbackPicture={
                                                            h.user &&
                                                            me.email &&
                                                            h.user.toLowerCase() === me.email.toLowerCase()
                                                                ? me.picture
                                                                : undefined
                                                        }
                                                    />
                                                ) : null}
                                            </Table.Td>
                                            <Table.Td>{showTime ? formatTime(h.time) : ''}</Table.Td>
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
                                });
                            })()}
                        </Table.Tbody>
                    </React.Fragment>
                ))}
            </Table>

            <Modal
                centered
                opened={editOpened}
                onClose={closeEdit}
                title={<Label>Edit history entry</Label>}
                closeOnEscape={!loading}
                closeOnClickOutside={!loading}
            >
                <Stack>
                    <TextInput
                        label={<Label>User</Label>}
                        value={editUser}
                        onChange={(e) => setEditUser(e.target.value)}
                    />
                    <Textarea
                        label={<Label>Amounts JSON</Label>}
                        value={editJson}
                        onChange={(e) => setEditJson(e.target.value)}
                        minRows={10}
                        autosize
                    />
                    {editError && (
                        <Alert variant="light" color="red" icon={<IconAlertCircle size={18} />}>
                            {editError}
                        </Alert>
                    )}
                    <Group justify="right">
                        <Button variant="outline" color="gray" onClick={closeEdit} disabled={loading}>
                            <Label>Cancel</Label>
                        </Button>
                        <Button onClick={submitEdit} loading={loading}>
                            <Label>Update</Label>
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

export function HistoryPage() {
    const request = useApiRequest();
    const [, setActive] = useActiveContent<ProductUpdateHistoryItem>();
    const [reload, setReload] = useState<() => Promise<void>>(() => async () => undefined);

    const handleDelete = useCallback(
        async (item: ProductUpdateHistoryItem) => {
            const result = await request<ApiResult>(ApiUrl.ProductsHistoryDelete, {
                group: item.group,
                name: item.name,
                time: item.time,
                year: item.year,
            });
            assertOk(result as ApiResult<object>);
            setActive(); // close swipe/selection
            await reload();
        },
        [reload, request, setActive]
    );

    return (
        <GroupFilterWrapper>
            <QuickFilterWrapper>
                <YearFilterWrapper>
                    <Page<ProductUpdateHistoryItem>
                        toolbar={
                            <>
                                <ToolbarGroupFilter />
                                <ToolbarYearFilter />
                            </>
                        }
                        onDelete={handleDelete}
                    >
                        <SwipeControlsWrapper>
                            <HistoryContent setReload={setReload} />
                            <HistorySwipeControls />
                        </SwipeControlsWrapper>
                    </Page>
                </YearFilterWrapper>
            </QuickFilterWrapper>
        </GroupFilterWrapper>
    );
}
