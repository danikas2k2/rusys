import { Button, Group, Modal, Stack, Title } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';

import { AmountVariant } from '~/client/common/AmountVariant';
import { ChangeBadge } from '~/client/common/ChangeBadge';
import { Label } from '~/client/common/Label';
import { VariantEditRow, type VariantEditType } from '~/client/pages/products/VariantEditRow';

import './VariantEditBox.pcss';

export interface VariantDeltas {
    updated: number;
    consumed: number;
    recycled: number;
}

export interface VariantEditBoxProps {
    opened: boolean;
    group: string;
    name: string;
    year: number;
    variant: string;
    currentAmount: number;
    onSubmit: (deltas: VariantDeltas) => void;
    onClose: () => void;
}

const ZERO_DELTAS: VariantDeltas = { updated: 0, consumed: 0, recycled: 0 };

export function VariantEditBox({
    opened,
    group,
    name,
    year,
    variant,
    currentAmount,
    onSubmit,
    onClose,
}: VariantEditBoxProps) {
    const [deltas, setDeltas] = useState<VariantDeltas>(ZERO_DELTAS);

    const handleChange = useCallback((type: VariantEditType, value: number) => {
        setDeltas((prev) => ({ ...prev, [type]: value }));
    }, []);

    const totalDelta = deltas.updated + deltas.consumed + deltas.recycled;
    const resultAmount = currentAmount + totalDelta;
    const hasChanges = deltas.updated !== 0 || deltas.consumed !== 0 || deltas.recycled !== 0;

    const minUpdated = useMemo(
        () => -(currentAmount + deltas.consumed + deltas.recycled),
        [currentAmount, deltas.consumed, deltas.recycled]
    );
    const minConsumed = useMemo(
        () => -(currentAmount + deltas.updated + deltas.recycled),
        [currentAmount, deltas.updated, deltas.recycled]
    );
    const minRecycled = useMemo(
        () => -(currentAmount + deltas.updated + deltas.consumed),
        [currentAmount, deltas.updated, deltas.consumed]
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (hasChanges) {
                onSubmit(deltas);
            }
            onClose();
        },
        [deltas, hasChanges, onClose, onSubmit]
    );

    const handleClose = useCallback(() => {
        setDeltas(ZERO_DELTAS);
        onClose();
    }, [onClose]);

    const handleExitTransitionEnd = useCallback(() => {
        setDeltas(ZERO_DELTAS);
    }, []);

    return (
        <Modal
            className="variant-edit-box"
            size="xs"
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': 'Close variant' }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={
                <Stack gap={2}>
                    <Title order={4} fz="h2">
                        {name}
                    </Title>
                    <Title order={4} fz="lg">
                        {group}
                        {!!year && `, ${year}`}
                    </Title>
                    <Title order={4} fz="lg">
                        <AmountVariant variant={variant} />
                    </Title>
                    <Title order={4} fz="h2">
                        <span style={{ position: 'relative' }}>
                            {resultAmount}
                            <ChangeBadge
                                change={
                                    deltas.updated + deltas.recycled + deltas.recycled ||
                                    !!deltas.updated ||
                                    !!deltas.recycled ||
                                    !!deltas.recycled
                                }
                                position="top-right"
                            />
                        </span>
                    </Title>
                </Stack>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="xs" mb="md">
                    <VariantEditRow
                        type="updated"
                        delta={deltas.updated}
                        minDelta={minUpdated}
                        onChange={handleChange}
                    />
                    <VariantEditRow
                        type="consumed"
                        delta={deltas.consumed}
                        minDelta={minConsumed}
                        onChange={handleChange}
                    />
                    <VariantEditRow
                        type="recycled"
                        delta={deltas.recycled}
                        minDelta={minRecycled}
                        onChange={handleChange}
                    />
                </Stack>

                <Group justify="center" gap="xs">
                    <Button variant="default" size="sm" leftSection={<IconX size={16} />} onClick={handleClose}>
                        <Label>Cancel</Label>
                    </Button>
                    <Button type="submit" size="sm" leftSection={<IconCheck size={16} />} disabled={!hasChanges}>
                        <Label>Update</Label>
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
