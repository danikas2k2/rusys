import { Alert, Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Label } from '~/client/common/Label';
import { getErrorMessage } from '~/client/utils/errors';
import type { ProductUpdateHistoryItem, VariantAmount } from '~/types/data';
import { useUpdateHistoryEntry } from '../hooks/useUpdateHistoryEntry';

function parseAmountsJson(editJson: string): VariantAmount[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(editJson);
    } catch {
        throw new Error('Invalid JSON');
    }
    if (!Array.isArray(parsed)) {
        throw new Error('Amounts must be an array');
    }
    return parsed.map((a) => {
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
}

export function EditHistoryEntryDialog({
    opened,
    onClose,
    item,
    onUpdated,
}: {
    opened: boolean;
    onClose: () => void;
    item: ProductUpdateHistoryItem | null;
    onUpdated: () => Promise<void>;
}): React.ReactElement {
    const update = useUpdateHistoryEntry();
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editUser, setEditUser] = useState('');
    const [editJson, setEditJson] = useState('[]');

    const title = useMemo(() => <Label>Edit history entry</Label>, []);

    useEffect(() => {
        if (!opened || !item) {
            return;
        }
        setEditUser(item.user ?? '');
        setEditJson(JSON.stringify(item.amounts ?? [], null, 2));
        setEditError(null);
    }, [item, opened]);

    const handleClose = useCallback(() => {
        if (saving) {
            return;
        }
        onClose();
    }, [onClose, saving]);

    const handleSubmit = useCallback(async () => {
        if (!item) {
            return;
        }
        setEditError(null);
        setSaving(true);
        try {
            const amounts = parseAmountsJson(editJson);
            await update({
                group: item.group,
                name: item.name,
                time: item.time,
                year: item.year,
                amounts,
                user: editUser?.trim() || undefined,
            });
            await onUpdated();
            onClose();
        } catch (e) {
            setEditError(getErrorMessage(e));
        } finally {
            setSaving(false);
        }
    }, [editJson, editUser, item, onClose, onUpdated, update]);

    return (
        <Modal
            centered
            opened={opened}
            onClose={handleClose}
            title={title}
            closeOnEscape={!saving}
            closeOnClickOutside={!saving}
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
                    <Button variant="outline" color="gray" onClick={handleClose} disabled={saving}>
                        <Label>Cancel</Label>
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        <Label>Update</Label>
                    </Button>
                </Group>
                {!editError && saving && (
                    <Text size="xs" c="dimmed">
                        <Label>Updating…</Label>
                    </Text>
                )}
            </Stack>
        </Modal>
    );
}


