import { Badge, Button, Flex, Group, Select, Stack, Table, Text, type ComboboxItem } from '@mantine/core';
import { IconArrowBackUp, IconArrowForwardUp, IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountVariant } from '~/client/common/AmountVariant';
import { ChangeBadge } from '~/client/common/ChangeBadge';
import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { VariantExpandedRows, type VariantDelta } from '~/client/pages/products/VariantExpandedRows';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useProducts } from '~/client/state/products/useProducts';
import { useRedoProduct } from '~/client/state/products/useRedoProduct';
import { useUndoProduct } from '~/client/state/products/useUndoProduct';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';
import { useProfile } from '~/client/state/profile/useProfile';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { getVariantAmount } from '~/common/utils/amounts';
import type { ProductAmounts, VariantAmount } from '~/types/data';

const ZERO_DELTA: VariantDelta = { updated: 0, consumed: 0, recycled: 0 };

export function ValueQuantitiesTab() {
    const _ = useLabels();
    const [active] = useActiveContent<ProductAmounts>();
    const [, setUpdating] = useUpdatingProducts();
    const profile = useProfile();
    const updateProduct = useUpdateProduct();
    const undoProduct = useUndoProduct();
    const redoProduct = useRedoProduct();
    const products = useProducts();

    const activeData = active?.data;
    const group = activeData?.group ?? '';
    const name = activeData?.name ?? '';
    const year = activeData?.year ?? 0;
    const amounts = activeData?.amounts;

    const activeProduct = useMemo(
        () =>
            activeData ? products.find((p) => p.group === activeData.group && p.name === activeData.name) : undefined,
        [activeData, products]
    );

    const liveAmounts = useMemo(
        () => activeProduct?.years?.find((y) => y.year === year)?.amounts ?? amounts,
        [activeProduct, year, amounts]
    );

    const undoCount = activeProduct?.updates?.filter((u) => 'year' in u && u.year === year).length ?? 0;
    const redoCount = activeProduct?.undates?.filter((u) => 'year' in u && u.year === year).length ?? 0;
    const canUndo = undoCount > 0;
    const canRedo = redoCount > 0;

    const allVariants = useAllVariants(group);
    const compareVariants = useGroupVariantComparator(group);

    const presentVariants = useMemo(() => {
        const fromAmounts = liveAmounts?.filter((a) => a.amount > 0).map((a) => a.variant) ?? [];
        return [...fromAmounts].sort(compareVariants);
    }, [liveAmounts, compareVariants]);

    const [extraVariants, setExtraVariants] = useState<string[]>([]);

    const visibleVariants = useMemo(() => {
        const combined = Array.from(new Set([...presentVariants, ...extraVariants]));
        return combined.sort(compareVariants);
    }, [compareVariants, extraVariants, presentVariants]);

    const unusedVariants = useMemo(
        () => allVariants.filter((v) => !visibleVariants.includes(v)),
        [allVariants, visibleVariants]
    );

    const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
    const [allDeltas, setAllDeltas] = useState<Record<string, VariantDelta>>({});
    const [comment, setComment] = useState('');

    const [addingVariant, setAddingVariant] = useState(false);
    const handleAddVariantOpen = useCallback(() => setAddingVariant(true), []);
    const handleAddVariantClose = useCallback((_newGroup?: string, newVariant?: string) => {
        setAddingVariant(false);
        if (newVariant) {
            setExtraVariants((prev) => [...prev, newVariant]);
            setExpandedVariant(newVariant);
        }
    }, []);
    const handleAddVariantAfterClose = useCallback(() => setAddingVariant(false), []);

    const handleSelectVariant = useCallback((variant: string | null) => {
        if (!variant) {
            return;
        }
        setExtraVariants((prev) => [...prev, variant]);
        setExpandedVariant(variant);
    }, []);

    const handleRowClick = useCallback((variant: string) => {
        setExpandedVariant((prev) => (prev === variant ? null : variant));
    }, []);

    const handleDeltaChange = useCallback(
        (type: keyof VariantDelta, value: number) => {
            setAllDeltas((prev) => ({
                ...prev,
                [expandedVariant!]: { ...(prev[expandedVariant!] ?? ZERO_DELTA), [type]: value },
            }));
        },
        [expandedVariant]
    );

    const hasChanges = useMemo(
        () => Object.values(allDeltas).some((d) => d.updated !== 0 || d.consumed !== 0 || d.recycled !== 0),
        [allDeltas]
    );

    const handleCancel = useCallback(() => {
        setAllDeltas({});
        setComment('');
        setExpandedVariant(null);
    }, []);

    const handleUpdate = useCallback(async () => {
        const changes: VariantAmount[] = [];
        for (const [variant, deltas] of Object.entries(allDeltas)) {
            if (deltas.updated !== 0) {
                changes.push({ variant, amount: deltas.updated });
            }
            if (deltas.consumed !== 0) {
                changes.push({ variant, amount: deltas.consumed, recycled: false });
            }
            if (deltas.recycled !== 0) {
                changes.push({ variant, amount: deltas.recycled, recycled: true });
            }
        }
        if (activeData) {
            setUpdating(activeData, true);
            await updateProduct(group, name, year, changes, profile.email, comment || undefined).finally(() =>
                setUpdating(activeData, false)
            );
            setAllDeltas({});
            setComment('');
            setExpandedVariant(null);
        }
    }, [allDeltas, activeData, group, name, year, profile.email, comment, setUpdating, updateProduct]);

    const handleUndo = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setAllDeltas({});
        setExpandedVariant(null);
        setUpdating(activeData, true);
        await undoProduct(group, name, year).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, setUpdating, undoProduct]);

    const handleRedo = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setAllDeltas({});
        setExpandedVariant(null);
        setUpdating(activeData, true);
        await redoProduct(group, name, year).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, setUpdating, redoProduct]);

    return (
        <>
            <Stack gap="sm">
                <Table layout="fixed">
                    <Table.Tbody>
                        {visibleVariants.map((variant) => {
                            const variantDelta = allDeltas[variant] ?? ZERO_DELTA;
                            const totalDelta = variantDelta.updated + variantDelta.consumed + variantDelta.recycled;
                            const totalChanges =
                                !!variantDelta.updated || !!variantDelta.consumed || !!variantDelta.recycled;
                            const baseAmount = getVariantAmount(liveAmounts, variant);
                            const displayAmount = baseAmount + totalDelta;
                            const isExpanded = expandedVariant === variant;

                            return (
                                <React.Fragment key={variant}>
                                    <Table.Tr
                                        data-variant
                                        data-expanded={isExpanded}
                                        onClick={() => handleRowClick(variant)}
                                    >
                                        <Table.Td>
                                            <Text fz="md" fw={500}>
                                                <AmountVariant variant={variant} />
                                            </Text>
                                        </Table.Td>
                                        <Table.Td align="right">
                                            <Group gap="xs">
                                                <Text fz="md" component="span">
                                                    {displayAmount}
                                                </Text>
                                                <ChangeBadge change={totalDelta || totalChanges} />
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                    {isExpanded && (
                                        <Table.Tr>
                                            <Table.Td colSpan={2}>
                                                <VariantExpandedRows
                                                    delta={variantDelta}
                                                    baseAmount={baseAmount}
                                                    comment={comment}
                                                    onChange={handleDeltaChange}
                                                    onCommentChange={setComment}
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
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
                            <Group gap="xs" data-separator={!!unusedVariants.length}>
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

                {(canUndo || canRedo) && !expandedVariant && !hasChanges && (
                    <Flex justify="center" gap="xs">
                        <Button
                            variant="default"
                            size="sm"
                            leftSection={<IconArrowBackUp size={16} />}
                            rightSection={
                                undoCount > 0 ? (
                                    <Badge size="sm" variant="filled" circle>
                                        {undoCount}
                                    </Badge>
                                ) : undefined
                            }
                            onClick={handleUndo}
                            disabled={!canUndo}
                        >
                            <Label>Undo</Label>
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            leftSection={<IconArrowForwardUp size={16} />}
                            rightSection={
                                redoCount > 0 ? (
                                    <Badge size="sm" variant="filled" circle>
                                        {redoCount}
                                    </Badge>
                                ) : undefined
                            }
                            onClick={handleRedo}
                            disabled={!canRedo}
                        >
                            <Label>Redo</Label>
                        </Button>
                    </Flex>
                )}

                {(expandedVariant || hasChanges) && (
                    <Group justify="center" gap="xs">
                        <Button variant="default" size="sm" leftSection={<IconX size={16} />} onClick={handleCancel}>
                            <Label>Cancel</Label>
                        </Button>
                        <Button
                            size="sm"
                            leftSection={<IconCheck size={16} />}
                            onClick={handleUpdate}
                            disabled={!hasChanges}
                        >
                            <Label>Update</Label>
                        </Button>
                    </Group>
                )}
            </Stack>

            <VariantBox
                opened={addingVariant}
                group={group}
                onClose={handleAddVariantClose}
                onAfterClose={handleAddVariantAfterClose}
            />
        </>
    );
}
