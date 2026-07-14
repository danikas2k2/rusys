import { Button, Flex, Group, Select, Stack, Table, Text, type ComboboxItem } from '@mantine/core';
import { IconArrowBackUp, IconArrowForwardUp, IconPlus } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountVariant } from '~/client/common/AmountVariant';
import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { VariantEditBox, type VariantDeltas } from '~/client/pages/products/VariantEditBox';
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

    const canUndo = !!activeProduct?.updates?.some((u) => 'year' in u && u.year === year);
    const canRedo = !!activeProduct?.undates?.some((u) => 'year' in u && u.year === year);

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
            if (changes.length && activeData) {
                setUpdating(activeData, true);
                await updateProduct(group, name, year, changes, profile.email).finally(() =>
                    setUpdating(activeData, false)
                );
            }
            setActiveVariant(null);
        },
        [activeVariant, activeData, group, name, year, profile.email, setUpdating, updateProduct]
    );

    const handleEditClose = useCallback(() => setActiveVariant(null), []);

    const handleUndo = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setUpdating(activeData, true);
        await undoProduct(group, name, year).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, setUpdating, undoProduct]);

    const handleRedo = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setUpdating(activeData, true);
        await redoProduct(group, name, year).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, setUpdating, redoProduct]);

    const activeAmount = activeVariant ? getVariantAmount(amounts, activeVariant) : 0;

    return (
        <>
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
                            onClick={handleUndo}
                            disabled={!canUndo}
                        >
                            <Label>Undo</Label>
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            leftSection={<IconArrowForwardUp size={16} />}
                            onClick={handleRedo}
                            disabled={!canRedo}
                        >
                            <Label>Redo</Label>
                        </Button>
                    </Flex>
                )}
            </Stack>

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
