import { Accordion, Badge, Button, Flex, Group, Select, Stack, Text, type ComboboxItem } from '@mantine/core';
import {
    IconAlertTriangle,
    IconArrowBackUp,
    IconArrowForwardUp,
    IconCheck,
    IconHome,
    IconPlus,
    IconTilde,
    IconX,
} from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ChangeBadge } from '~/client/common/ChangeBadge';
import { Label } from '~/client/common/Label';
import { VariantTitle } from '~/client/common/VariantTitle';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountExpanded, type VariantDelta } from '~/client/pages/products/AmountExpanded';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { HOME_SUFFIX, SUSPICIOUS_SUFFIX } from '~/client/pages/products/utils/variantKeys';
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

function toKey(variant: string, suspicious: boolean, home?: boolean) {
    if (home) {
        return `${variant}${HOME_SUFFIX}`;
    }
    return suspicious ? `${variant}${SUSPICIOUS_SUFFIX}` : variant;
}

function fromKey(key: string): { variant: string; suspicious: boolean; home: boolean } {
    if (key.endsWith(HOME_SUFFIX)) {
        return { variant: key.slice(0, -HOME_SUFFIX.length), suspicious: false, home: true };
    }
    const suspicious = key.endsWith(SUSPICIOUS_SUFFIX);
    return { variant: suspicious ? key.slice(0, -SUSPICIOUS_SUFFIX.length) : key, suspicious, home: false };
}

export function AmountVariantsTab() {
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
        () => (activeProduct ? (activeProduct.years?.find((y) => y.year === year)?.amounts ?? []) : amounts),
        [activeProduct, year, amounts]
    );

    const undoCount = activeProduct?.updates?.filter((u) => 'year' in u && u.year === year).length ?? 0;
    const redoCount = activeProduct?.undates?.filter((u) => 'year' in u && u.year === year).length ?? 0;
    const canUndo = undoCount > 0;
    const canRedo = redoCount > 0;

    const allVariants = useAllVariants(group);
    const compareVariants = useGroupVariantComparator(group);

    const presentKeys = useMemo(() => {
        const current = liveAmounts ?? amounts;
        return (current?.filter((a) => a.amount > 0).map((a) => toKey(a.variant, !!a.suspicious, !!a.home)) ?? []).sort(
            (a, b) => {
                const ka = fromKey(a);
                const kb = fromKey(b);
                return compareVariants(ka.variant, kb.variant) || (ka.home ? 1 : ka.suspicious ? 1 : -1);
            }
        );
    }, [liveAmounts, amounts, compareVariants]);

    const [extraKeys, setExtraKeys] = useState<string[]>([]);

    const visibleKeys = useMemo(() => {
        const combined = Array.from(new Set([...presentKeys, ...extraKeys]));
        return combined
            .filter((k) => {
                const { variant, suspicious, home } = fromKey(k);
                return extraKeys.includes(k) || getVariantAmount(liveAmounts ?? amounts, variant, suspicious, home) > 0;
            })
            .sort((a, b) => {
                const ka = fromKey(a);
                const kb = fromKey(b);
                return compareVariants(ka.variant, kb.variant) || (ka.home ? 1 : ka.suspicious ? 1 : -1);
            });
    }, [compareVariants, extraKeys, presentKeys, liveAmounts, amounts]);

    const unusedVariants = useMemo(
        () => allVariants.filter((v) => !visibleKeys.includes(v)),
        [allVariants, visibleKeys]
    );

    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [allDeltas, setAllDeltas] = useState<Record<string, VariantDelta>>({});
    const [comment, setComment] = useState('');

    const [addingVariant, setAddingVariant] = useState(false);
    const handleAddVariantOpen = useCallback(() => setAddingVariant(true), []);
    const handleAddVariantClose = useCallback((_newGroup?: string, newVariant?: string) => {
        setAddingVariant(false);
        if (newVariant) {
            setExtraKeys((prev) => [...prev, newVariant]);
            setExpandedKey(newVariant);
        }
    }, []);
    const handleAddVariantAfterClose = useCallback(() => setAddingVariant(false), []);

    const handleSelectVariant = useCallback((variant: string | null) => {
        if (!variant) {
            return;
        }
        setExtraKeys((prev) => [...prev, variant]);
        setExpandedKey(variant);
    }, []);

    const handleAddSuspicious = useCallback((variant: string) => {
        const key = toKey(variant, true);
        setExtraKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
        setExpandedKey(key);
    }, []);

    const handleAddHome = useCallback((variant: string) => {
        const key = toKey(variant, false, true);
        setExtraKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
        setExpandedKey(key);
    }, []);

    const handleDeltaChange = useCallback(
        (type: keyof VariantDelta, value: number) => {
            setAllDeltas((prev) => ({
                ...prev,
                [expandedKey!]: { ...(prev[expandedKey!] ?? ZERO_DELTA), [type]: value },
            }));
        },
        [expandedKey]
    );

    const hasChanges = useMemo(
        () => Object.values(allDeltas).some((d) => d.updated !== 0 || d.consumed !== 0 || d.recycled !== 0),
        [allDeltas]
    );

    const handleCancel = useCallback(() => {
        setAllDeltas({});
        setComment('');
        setExpandedKey(null);
        setExtraKeys([]);
    }, []);

    const handleUpdate = useCallback(async () => {
        const changes: VariantAmount[] = [];
        for (const [key, deltas] of Object.entries(allDeltas)) {
            const { variant, suspicious, home } = fromKey(key);
            const flags = { ...(suspicious ? { suspicious } : {}), ...(home ? { home } : {}) };
            if (deltas.updated !== 0) {
                changes.push({ variant, amount: deltas.updated, ...flags });
            }
            if (deltas.consumed !== 0) {
                changes.push({ variant, amount: deltas.consumed, recycled: false, ...flags });
            }
            if (deltas.recycled !== 0) {
                changes.push({ variant, amount: deltas.recycled, recycled: true, ...flags });
            }
        }
        if (activeData) {
            setUpdating(activeData, true);
            await updateProduct(group, name, year, changes, profile.email, comment || undefined).finally(() =>
                setUpdating(activeData, false)
            );
            setAllDeltas({});
            setComment('');
            setExpandedKey(null);
            setExtraKeys([]);
        }
    }, [allDeltas, activeData, group, name, year, profile.email, comment, setUpdating, updateProduct]);

    const handleUndo = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setAllDeltas({});
        setExpandedKey(null);
        setUpdating(activeData, true);
        await undoProduct(group, name, year).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, setUpdating, undoProduct]);

    const handleRedo = useCallback(async (): Promise<void> => {
        if (!activeData) {
            return;
        }
        setAllDeltas({});
        setExpandedKey(null);
        setUpdating(activeData, true);
        await redoProduct(group, name, year).finally(() => setUpdating(activeData, false));
    }, [activeData, group, name, year, setUpdating, redoProduct]);

    return (
        <>
            <Stack gap="sm">
                <Accordion value={expandedKey} onChange={setExpandedKey} variant="contained" radius="md" chevron={null}>
                    {visibleKeys.map((key) => {
                        const { variant, suspicious, home } = fromKey(key);
                        const variantDelta = allDeltas[key] ?? ZERO_DELTA;
                        const totalDelta = variantDelta.updated + variantDelta.consumed + variantDelta.recycled;
                        const totalChanges =
                            !!variantDelta.updated || !!variantDelta.consumed || !!variantDelta.recycled;
                        const baseAmount = getVariantAmount(liveAmounts, variant, suspicious, home);
                        const displayAmount = baseAmount + totalDelta;
                        const hasSuspicious = visibleKeys.includes(toKey(variant, true));
                        const hasHome = visibleKeys.includes(toKey(variant, false, true));

                        return (
                            <Accordion.Item
                                key={key}
                                value={key}
                                data-suspicious={suspicious || undefined}
                                data-home={home || undefined}
                            >
                                <Accordion.Control>
                                    <Group justify="space-between">
                                        <Group gap={4}>
                                            {suspicious && (
                                                <IconAlertTriangle
                                                    size={14}
                                                    color="var(--mantine-color-moderate-text)"
                                                />
                                            )}
                                            {home && <IconHome size={14} color="var(--mantine-color-blue-text)" />}
                                            <Text
                                                fz="md"
                                                fw={500}
                                                c={suspicious ? 'moderate' : home ? 'blue' : undefined}
                                            >
                                                <VariantTitle group={group} variant={variant} />
                                            </Text>
                                        </Group>
                                        <Group gap="xs">
                                            <Text
                                                fz="md"
                                                component="span"
                                                c={suspicious ? 'moderate' : home ? 'blue' : undefined}
                                            >
                                                {home && <IconTilde size={12} style={{ verticalAlign: 'middle' }} />}
                                                {displayAmount}
                                            </Text>
                                            <ChangeBadge change={totalDelta || totalChanges} />
                                        </Group>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <AmountExpanded
                                        delta={variantDelta}
                                        baseAmount={baseAmount}
                                        comment={comment}
                                        onChange={handleDeltaChange}
                                        onCommentChange={setComment}
                                        onAddSuspicious={
                                            !suspicious && !home && !hasSuspicious
                                                ? () => handleAddSuspicious(variant)
                                                : undefined
                                        }
                                        onAddHome={
                                            !suspicious && !home && !hasHome ? () => handleAddHome(variant) : undefined
                                        }
                                    />
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>

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
                            <Text>
                                <VariantTitle group={group} variant={option.label} />
                            </Text>
                        )
                    }
                    withScrollArea={false}
                    comboboxProps={{ middlewares: { flip: false, shift: false } }}
                    size="sm"
                    clearable={false}
                />

                {(canUndo || canRedo) && !expandedKey && !hasChanges && (
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

                {(expandedKey || hasChanges) && (
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
