import { Alert, Avatar, Button, Group, Modal, Stack, Table, Text, Textarea, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconRefresh, IconRobotFace, IconTrash } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { SwipePanel } from '~/client/common/SwipePanel';
import { SwipeControlsWrapper } from '~/client/common/SwipeControlsContext';
import { GroupFilterWrapper, useGroupFilter } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper, useQuickFilter } from '~/client/filters/QuickFilterContext';
import { YearFilterWrapper, useYearFilter } from '~/client/filters/YearFilterContext';
import { Page } from '~/client/pages/common/Page';
import { useApiRequest } from '~/client/state/common/useApiRequest';
import { DEV_MODE_EMAIL } from '~/client/state/profile/dev';
import { GroupTitle } from '~/client/table/GroupTitle';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { ToolbarGroupFilter } from '~/client/toolbar/ToolbarGroupFilter';
import { ToolbarYearFilter } from '~/client/toolbar/ToolbarYearFilter';
import { getErrorMessage } from '~/client/utils/errors';
import { ApiUrl, type ApiResult } from '~/types/api';
import type { ProductUpdateHistoryItem, VariantAmount } from '~/types/data';

type HistoryResponse = ApiResult<{ history: readonly ProductUpdateHistoryItem[] }>;

function assertOk<R extends object>(result: ApiResult<R>): asserts result is { ok: true } & R {
    if (!result.ok) {
        throw new Error(result.error || 'Request failed');
    }
}

function formatAmounts(amounts: readonly VariantAmount[]): string {
    return amounts
        .map((a) => `${a.variant}:${a.amount}${a.recycled ? ' (recycled)' : ''}`)
        .join(', ');
}

function dateKeyFromTime(time: number): string {
    const d = new Date(time);
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDateKey(key: string): string {
    const [y, m, d] = key.split('-').map((v) => parseInt(v, 10));
    // Fallback if parsing fails
    if (!y || !m || !d) {
        return key;
    }
    return new Date(y, m - 1, d).toLocaleDateString();
}

function formatTime(time: number): string {
    return new Date(time).toLocaleTimeString();
}

function EmailAvatar({ email }: { email?: string }): React.ReactElement | null {
    if (!email) {
        return null;
    }

    if (email.toLowerCase() === DEV_MODE_EMAIL.toLowerCase()) {
        return (
            <Avatar color="cyan.9" variant="outline" radius="50%" size="sm" data-robot="true">
                <IconRobotFace size="60%" />
            </Avatar>
        );
    }

    const initials = email
        .split('@', 1)[0]
        .split(/[.\-_ ]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join('');

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

function HistoryContent({
    setReload,
}: {
    setReload?: React.Dispatch<React.SetStateAction<() => Promise<void>>>;
}) {
    const request = useApiRequest();
    const [groupFilter] = useGroupFilter();
    const [quickFilter] = useQuickFilter();
    const [active, setActive] = useActiveContent<ProductUpdateHistoryItem>();
    const [year] = useYearFilter();

    const [history, setHistory] = useState<readonly ProductUpdateHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        void load();
    }, [load]);

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

    const groupedByDate = useMemo(() => {
        const map = new Map<string, ProductUpdateHistoryItem[]>();
        for (const h of filtered) {
            const key = dateKeyFromTime(h.time);
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(h);
        }
        return Array.from(map.entries()).map(([dateKey, items]) => ({ dateKey, items }));
    }, [filtered]);

    return (
        <>
            <Group justify="space-between" mb="sm">
                <Stack gap={0}>
                    <Title order={3}>
                        <Label>History</Label>
                    </Title>
                    <Text size="sm" c="dimmed">
                        <Label>Showing latest</Label> {history.length} <Label>entries</Label>
                    </Text>
                </Stack>
                <Button
                    variant="light"
                    leftSection={<IconRefresh size={18} />}
                    onClick={load}
                    loading={loading}
                    disabled={loading}
                >
                    <Label>Reload</Label>
                </Button>
            </Group>

            {error && (
                <Alert variant="light" color="red" icon={<IconAlertCircle size={18} />} mb="sm">
                    {error}
                </Alert>
            )}

            <Table striped highlightOnHover withTableBorder data-table="history">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>
                            <Label>User</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Time</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Group</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Product</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Year</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Amounts</Label>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                {groupedByDate.map(({ dateKey, items }) => (
                    <React.Fragment key={dateKey}>
                        <GroupTitle colSpan={6}>
                            <Group justify="space-between">
                                <Label>{formatDateKey(dateKey)}</Label>
                                <Text size="sm" c="dimmed">
                                    {items.length}
                                </Text>
                            </Group>
                        </GroupTitle>
                        <Table.Tbody>
                            {items.map((h) => (
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
                                        <EmailAvatar email={h.user} />
                                    </Table.Td>
                                    <Table.Td>{formatTime(h.time)}</Table.Td>
                                    <Table.Td>{h.group}</Table.Td>
                                    <Table.Td>{h.name}</Table.Td>
                                    <Table.Td>{h.year}</Table.Td>
                                    <Table.Td>{formatAmounts(h.amounts ?? [])}</Table.Td>
                                </SwipeableRow>
                            ))}
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
                    <TextInput label={<Label>User</Label>} value={editUser} onChange={(e) => setEditUser(e.target.value)} />
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
                                <div style={{ width: 200 }}>
                                    <ToolbarGroupFilter />
                                </div>
                                <div style={{ width: 120 }}>
                                    <ToolbarYearFilter />
                                </div>
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


