import {
    Button,
    Flex,
    Group,
    Modal,
    Select,
    Stack,
    Table,
    Text,
    type ComboboxItem,
    type ModalProps,
} from '@mantine/core';
import { IconArrowBackUp, IconArrowForwardUp, IconPlus } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';

import { AmountVariant } from '~/client/common/AmountVariant';
import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { VariantEditBox, type VariantDeltas } from '~/client/pages/products/VariantEditBox';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { getVariantAmount } from '~/common/utils/amounts';
import type { VariantAmount } from '~/types/data';

import './ValueListBox.pcss';

export interface ValueListBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    group: string;
    name?: string;
    year?: number;
    amounts?: readonly VariantAmount[];
    onSubmit?: (changes: readonly VariantAmount[]) => Promise<void>;
    onClose?: () => void;
    onAfterClose?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function ValueListBox({
    opened = false,
    title,
    group,
    name = '',
    year = 0,
    amounts,
    onSubmit,
    onClose,
    onAfterClose,
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo,
}: ValueListBoxProps) {
    const _ = useLabels();
    const allVariants = useAllVariants(group);
    const compareVariants = useGroupVariantComparator(group);

    const presentVariants = useMemo(() => {
        const fromAmounts = amounts?.filter((a) => a.amount > 0).map((a) => a.variant) ?? [];
        return [...fromAmounts].sort(compareVariants);
    }, [amounts, compareVariants]);

    const [extraVariants, setExtraVariants] = useState<string[]>([]);

    const visibleVariants = useMemo(() => {
        const combined = Array.from(new Set([...presentVariants, ...extraVariants]));
        return combined.sort(compareVariants);
    }, [compareVariants, extraVariants, presentVariants]);

    const unusedVariants = useMemo(
        () => allVariants.filter((v) => !visibleVariants.includes(v)),
        [allVariants, visibleVariants]
    );

    const [activeVariant, setActiveVariant] = useState<string | null>(null);

    const [addingVariant, setAddingVariant] = useState(false);
    const handleAddVariantOpen = useCallback(() => setAddingVariant(true), []);
    const handleAddVariantClose = useCallback((_newGroup?: string, newVariant?: string) => {
        setAddingVariant(false);
        if (newVariant) {
            setExtraVariants((prev) => [...prev, newVariant]);
            setActiveVariant(newVariant);
        }
    }, []);
    const handleAddVariantAfterClose = useCallback(() => setAddingVariant(false), []);

    const handleRowClick = useCallback((variant: string) => setActiveVariant(variant), []);

    const handleSelectVariant = useCallback((variant: string | null) => {
        if (!variant) {
            return;
        }
        setExtraVariants((prev) => [...prev, variant]);
        setActiveVariant(variant);
    }, []);

    const handleEditSubmit = useCallback(
        async (deltas: VariantDeltas): Promise<void> => {
            const changes: VariantAmount[] = [];
            if (deltas.updated !== 0) {
                changes.push({ variant: activeVariant!, amount: deltas.updated });
            }
            if (deltas.consumed !== 0) {
                changes.push({ variant: activeVariant!, amount: deltas.consumed, recycled: false });
            }
            if (deltas.recycled !== 0) {
                changes.push({ variant: activeVariant!, amount: deltas.recycled, recycled: true });
            }
            if (changes.length && onSubmit) {
                await onSubmit(changes);
            }
            setActiveVariant(null);
        },
        [activeVariant, onSubmit]
    );

    const handleEditClose = useCallback(() => setActiveVariant(null), []);

    const handleClose = useCallback(() => onClose?.(), [onClose]);

    const handleExitTransitionEnd = useCallback(() => {
        setExtraVariants([]);
        setActiveVariant(null);
        onAfterClose?.();
    }, [onAfterClose]);

    const activeAmount = activeVariant ? getVariantAmount(amounts, activeVariant) : 0;

    return (
        <>
            <Modal
                className="value-list-box"
                fullScreen
                opened={opened}
                withCloseButton
                onClose={handleClose}
                closeButtonProps={{ 'aria-label': _('Close') }}
                onExitTransitionEnd={handleExitTransitionEnd}
                title={title}
            >
                <Stack gap="sm">
                    <Table highlightOnHover>
                        <Table.Tbody>
                            {visibleVariants.map((variant) => (
                                <Table.Tr
                                    key={variant}
                                    className="variant-row"
                                    onClick={() => handleRowClick(variant)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Table.Td>
                                        <Text fz="md" fw={500}>
                                            <AmountVariant variant={variant} />
                                        </Text>
                                    </Table.Td>
                                    <Table.Td align="right">
                                        <Text fz="md">{getVariantAmount(amounts, variant)}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>

                    <Select
                        placeholder={_('Select variant')}
                        data={[
                            ...unusedVariants.map((v) => ({ value: v, label: v })),
                            { value: '', label: _('New variant') },
                        ]}
                        value={null}
                        onChange={(v) => (v === '' ? handleAddVariantOpen() : handleSelectVariant(v))}
                        renderOption={({ option }: { option: ComboboxItem }) =>
                            option.value === '' ? (
                                <Group gap="xs" className={unusedVariants.length ? 'with-separator' : undefined}>
                                    <IconPlus size={14} />
                                    {option.label}
                                </Group>
                            ) : (
                                option.label
                            )
                        }
                        size="sm"
                        clearable={false}
                    />

                    {(canUndo || canRedo) && (
                        <Flex justify="center" gap="xs">
                            <Button
                                variant="default"
                                size="sm"
                                leftSection={<IconArrowBackUp size={16} />}
                                onClick={onUndo}
                                disabled={!canUndo}
                            >
                                <Label>Undo</Label>
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                leftSection={<IconArrowForwardUp size={16} />}
                                onClick={onRedo}
                                disabled={!canRedo}
                            >
                                <Label>Redo</Label>
                            </Button>
                        </Flex>
                    )}
                </Stack>
            </Modal>

            {activeVariant && (
                <VariantEditBox
                    opened={!!activeVariant}
                    group={group}
                    name={name}
                    year={year}
                    variant={activeVariant}
                    currentAmount={activeAmount}
                    onSubmit={handleEditSubmit}
                    onClose={handleEditClose}
                />
            )}

            <VariantBox
                opened={addingVariant}
                group={group}
                onClose={handleAddVariantClose}
                onAfterClose={handleAddVariantAfterClose}
            />
        </>
    );
}
