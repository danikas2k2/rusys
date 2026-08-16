import { Accordion, Avatar, Badge, Button, Flex, Group, Select, Stack, Text, type ComboboxItem } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import {
    AddIcon,
    ApproxAmountIcon,
    CancelIcon,
    DatedIcon,
    ExpiredIcon,
    ExpiringSoonIcon,
    HomeIcon,
    RedoIcon,
    SuspiciousIcon,
    UndoIcon,
    UpdateIcon,
} from '@icons';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ChangeBadge } from '~/client/common/ChangeBadge';
import { Label } from '~/client/common/Label';
import { VariantAvatar } from '~/client/common/VariantAvatar';
import { VariantTitle } from '~/client/common/VariantTitle';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountExpanded, type VariantDelta } from '~/client/pages/products/AmountExpanded';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { EXPIRY_INFIX, HOME_SUFFIX, SUSPICIOUS_SUFFIX } from '~/client/pages/products/utils/variantKeys';
import { VariantImagePicker } from '~/client/pages/products/VariantImagePicker';
import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useProducts } from '~/client/state/products/useProducts';
import { useRedoProduct } from '~/client/state/products/useRedoProduct';
import { useUndoProduct } from '~/client/state/products/useUndoProduct';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';
import { useProfile } from '~/client/state/profile/useProfile';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { getCombinedAmounts, getVariantAmount } from '~/common/utils/amounts';
import { formatDateOnly, getExpiryStatus, parseDateOnly } from '~/common/utils/expiry';
import type { ProductAmounts, VariantAmount } from '~/types/data';

import './AmountVariantsTab.pcss';

const ZERO_DELTA: VariantDelta = { updated: 0, consumed: 0, recycled: 0 };

// A row is plain, suspicious, home, or dated - mutually exclusive. `VariantAmount`'s type shape
// doesn't enforce this itself; toKey/fromKey simply never emit more than one suffix per row.
function toKey(variant: string, suspicious: boolean, home?: boolean, expiresAt?: number) {
    if (expiresAt) {
        return `${variant}${EXPIRY_INFIX}${expiresAt}`;
    }
    if (home) {
        return `${variant}${HOME_SUFFIX}`;
    }
    return suspicious ? `${variant}${SUSPICIOUS_SUFFIX}` : variant;
}

function fromKey(key: string): { variant: string; suspicious: boolean; home: boolean; expiresAt?: number } {
    const expiryIndex = key.indexOf(EXPIRY_INFIX);
    if (expiryIndex !== -1) {
        return {
            variant: key.slice(0, expiryIndex),
            suspicious: false,
            home: false,
            expiresAt: Number(key.slice(expiryIndex + EXPIRY_INFIX.length)),
        };
    }
    if (key.endsWith(HOME_SUFFIX)) {
        return { variant: key.slice(0, -HOME_SUFFIX.length), suspicious: false, home: true };
    }
    const suspicious = key.endsWith(SUSPICIOUS_SUFFIX);
    return { variant: suspicious ? key.slice(0, -SUSPICIOUS_SUFFIX.length) : key, suspicious, home: false };
}

function compareKeys(a: string, b: string, compareVariants: (x: string, y: string) => number): number {
    const ka = fromKey(a);
    const kb = fromKey(b);
    const variantOrder = compareVariants(ka.variant, kb.variant);
    if (variantOrder) {
        return variantOrder;
    }
    const rank = (k: { suspicious: boolean; home: boolean; expiresAt?: number }) =>
        k.expiresAt ? 2 : k.home || k.suspicious ? 1 : 0;
    const rankOrder = rank(ka) - rank(kb);
    if (rankOrder) {
        return rankOrder;
    }
    return (ka.expiresAt ?? 0) - (kb.expiresAt ?? 0);
}

interface AmountVariantsTabProps {
    onChangesUpdate?: (hasChanges: boolean) => void;
    onClose?: () => void;
    scrollContainerRef?: RefObject<HTMLElement | null>;
}

export function AmountVariantsTab({ onChangesUpdate, onClose, scrollContainerRef }: AmountVariantsTabProps = {}) {
    const _ = useLabels();
    const [active] = useActiveContent<ProductAmounts>();
    const [, setUpdating] = useUpdatingProducts();
    const profile = useProfile();
    const updateProduct = useUpdateProduct();
    const undoProduct = useUndoProduct();
    const redoProduct = useRedoProduct();
    const products = useProducts();
    const now = new Date().getTime();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

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
        () =>
            activeProduct
                ? ((year
                      ? activeProduct.years?.find((y) => y.year === year)?.amounts
                      : getCombinedAmounts(activeProduct.years)) ?? [])
                : amounts,
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
        return (
            current?.filter((a) => a.amount > 0).map((a) => toKey(a.variant, !!a.suspicious, !!a.home, a.expiresAt)) ??
            []
        ).sort((a, b) => compareKeys(a, b, compareVariants));
    }, [liveAmounts, amounts, compareVariants]);

    const [extraKeys, setExtraKeys] = useState<string[]>([]);

    const visibleKeys = useMemo(() => {
        const combined = Array.from(new Set([...presentKeys, ...extraKeys]));
        return combined
            .filter((k) => {
                const { variant, suspicious, home, expiresAt } = fromKey(k);
                return (
                    extraKeys.includes(k) ||
                    getVariantAmount(liveAmounts ?? amounts, variant, suspicious, home, expiresAt) > 0
                );
            })
            .sort((a, b) => compareKeys(a, b, compareVariants));
    }, [compareVariants, extraKeys, presentKeys, liveAmounts, amounts]);

    const datedCountByVariant = useMemo(() => {
        const counts = new Map<string, number>();
        for (const key of visibleKeys) {
            const { variant, expiresAt } = fromKey(key);
            if (expiresAt) {
                counts.set(variant, (counts.get(variant) ?? 0) + 1);
            }
        }
        return counts;
    }, [visibleKeys]);

    const unusedVariants = useMemo(
        () => allVariants.filter((v) => !visibleKeys.includes(v)),
        [allVariants, visibleKeys]
    );

    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [allDeltas, setAllDeltas] = useState<Record<string, VariantDelta>>({});
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!expandedKey || !scrollContainerRef?.current) {
            return;
        }

        const container = scrollContainerRef.current;
        const scrollExpandedVariantIntoView = () => {
            const item = container.querySelector<HTMLElement>(`[data-amount-variant-key="${CSS.escape(expandedKey)}"]`);
            if (!item) {
                return;
            }
            const containerRect = container.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const margin = 8;
            const availableHeight = containerRect.height - margin * 2;
            const offset =
                itemRect.height > availableHeight || itemRect.top < containerRect.top + margin
                    ? itemRect.top - containerRect.top - margin
                    : Math.max(0, itemRect.bottom - containerRect.bottom + margin);
            if (offset) {
                container.scrollBy({ top: offset, behavior: 'smooth' });
            }
        };

        const frame = requestAnimationFrame(() => requestAnimationFrame(scrollExpandedVariantIntoView));
        const timeout = window.setTimeout(scrollExpandedVariantIntoView, 250);
        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
        };
    }, [expandedKey, scrollContainerRef, visibleKeys]);

    const [addingVariant, setAddingVariant] = useState(false);
    const handleAddVariantOpen = useCallback(() => setAddingVariant(true), []);
    const handleAddVariantClose = useCallback(
        (_newGroup?: string, newVariant?: string) => {
            setAddingVariant(false);
            if (newVariant) {
                setExtraKeys((prev) => [...prev, newVariant]);
                setExpandedKey(newVariant);
            }
        },
        [setExpandedKey]
    );
    const handleAddVariantAfterClose = useCallback(() => setAddingVariant(false), []);

    const handleSelectVariant = useCallback(
        (variant: string | null) => {
            if (!variant) {
                return;
            }
            setExtraKeys((prev) => [...prev, variant]);
            setExpandedKey(variant);
        },
        [setExpandedKey]
    );

    // When nothing is entered yet and there's only one variant to pick from, there's no real
    // choice to make - select it right away instead of making the user open a single-item dropdown.
    // Guarded by a ref (not just the conditions below) so cancelling the auto-picked row doesn't
    // make it reappear immediately, since that would make Cancel look like it did nothing.
    const autoSelectedRef = useRef(false);
    useEffect(() => {
        if (!autoSelectedRef.current && visibleKeys.length === 0 && unusedVariants.length === 1) {
            autoSelectedRef.current = true;
            handleSelectVariant(unusedVariants[0]);
        }
    }, [visibleKeys.length, unusedVariants, handleSelectVariant]);

    // The triggering button is only rendered while !hasSuspicious/!hasHome (see isPlain checks
    // below), so `key` can never already be in extraKeys here.
    const handleAddSuspicious = useCallback(
        (variant: string) => {
            const key = toKey(variant, true);
            setExtraKeys((prev) => [...prev, key]);
            setExpandedKey(key);
        },
        [setExpandedKey]
    );

    const handleAddHome = useCallback(
        (variant: string) => {
            const key = toKey(variant, false, true);
            setExtraKeys((prev) => [...prev, key]);
            setExpandedKey(key);
        },
        [setExpandedKey]
    );

    const handlePickExpiry = useCallback(
        (variant: string, value: string | null) => {
            if (!value) {
                return;
            }
            const expiresAt = parseDateOnly(value);
            const key = toKey(variant, false, false, expiresAt);
            setExtraKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
            setExpandedKey(key);
        },
        [setExpandedKey]
    );

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

    useEffect(() => {
        onChangesUpdate?.(hasChanges);
    }, [hasChanges, onChangesUpdate]);

    const handleCancel = useCallback(() => {
        setAllDeltas({});
        setComment('');
        setExpandedKey(null);
        setExtraKeys([]);
    }, [setExpandedKey]);

    // Year switching itself now lives in the shared ProductYearBar (rendered above both tabs in
    // AmountBox), which disables itself while hasChanges is true - so by the time `year` actually
    // changes here, any pending edit has already been resolved. This just clears local state left
    // over from the previous year once that happens.
    const prevYearRef = useRef(year);
    useEffect(() => {
        if (prevYearRef.current !== year) {
            prevYearRef.current = year;
            setAllDeltas({});
            setComment('');
            setExpandedKey(null);
            setExtraKeys([]);
        }
    }, [year]);

    const handleUpdate = useCallback(async () => {
        const changes: VariantAmount[] = [];
        for (const [key, deltas] of Object.entries(allDeltas)) {
            const { variant, suspicious, home, expiresAt } = fromKey(key);
            const flags = {
                ...(suspicious ? { suspicious } : {}),
                ...(home ? { home } : {}),
                ...(expiresAt ? { expiresAt } : {}),
            };
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
            setSubmitting(true);
            const loadingTimeout = setTimeout(() => setLoading(true), 300);
            setUpdating(activeData, true);
            try {
                await updateProduct(group, name, year, changes, profile.email, comment || undefined);
                setAllDeltas({});
                setComment('');
                setExpandedKey(null);
                setExtraKeys([]);
                onClose?.();
            } finally {
                clearTimeout(loadingTimeout);
                setUpdating(activeData, false);
                setSubmitting(false);
                setLoading(false);
            }
        }
    }, [
        allDeltas,
        activeData,
        group,
        name,
        year,
        profile.email,
        comment,
        setUpdating,
        updateProduct,
        setExpandedKey,
        onClose,
    ]);

    // Only ever wired to onClick while canUndo/canRedo is true, which itself requires activeData
    // (see activeProduct above) - so activeData is always defined here.
    const handleUndo = useCallback(async (): Promise<void> => {
        setAllDeltas({});
        setExpandedKey(null);
        setUpdating(activeData!, true);
        await undoProduct(group, name, year).finally(() => setUpdating(activeData!, false));
    }, [activeData, group, name, year, setUpdating, undoProduct, setExpandedKey]);

    const handleRedo = useCallback(async (): Promise<void> => {
        setAllDeltas({});
        setExpandedKey(null);
        setUpdating(activeData!, true);
        await redoProduct(group, name, year).finally(() => setUpdating(activeData!, false));
    }, [activeData, group, name, year, setUpdating, redoProduct, setExpandedKey]);

    return (
        <>
            <Stack gap="sm">
                <Accordion value={expandedKey} onChange={setExpandedKey} variant="contained" radius="md" chevron={null}>
                    {visibleKeys.map((key) => {
                        const { variant, suspicious, home, expiresAt } = fromKey(key);
                        const variantDelta = allDeltas[key] ?? ZERO_DELTA;
                        const totalDelta = variantDelta.updated + variantDelta.consumed + variantDelta.recycled;
                        const totalChanges =
                            !!variantDelta.updated || !!variantDelta.consumed || !!variantDelta.recycled;
                        const baseAmount = getVariantAmount(liveAmounts, variant, suspicious, home, expiresAt);
                        const displayAmount = baseAmount + totalDelta;
                        const hasSuspicious = visibleKeys.includes(toKey(variant, true));
                        const hasHome = visibleKeys.includes(toKey(variant, false, true));
                        const variantImage = activeProduct?.variantImages?.[variant];
                        const expiryStatus = expiresAt ? getExpiryStatus(expiresAt, now) : undefined;
                        // Suspicious/home/expiry may only be added from the plain row.
                        const isPlain = !suspicious && !home && !expiresAt;
                        const ExpiryRowIcon =
                            expiryStatus === 'expired'
                                ? ExpiredIcon
                                : expiryStatus === 'soon'
                                  ? ExpiringSoonIcon
                                  : DatedIcon;
                        const datedCount = datedCountByVariant.get(variant) ?? 0;

                        return (
                            <Accordion.Item
                                key={key}
                                value={key}
                                data-amount-variant-key={key}
                                data-suspicious={suspicious || undefined}
                                data-home={home || undefined}
                                data-expires={expiryStatus || undefined}
                            >
                                <Accordion.Control>
                                    <Group justify="space-between">
                                        <Group gap={4}>
                                            {variantImage && (
                                                <Avatar src={variantImage} radius="sm" size={20} alt="">
                                                    {variant.trim().charAt(0).toUpperCase()}
                                                </Avatar>
                                            )}
                                            {suspicious && <SuspiciousIcon size={14} />}
                                            {home && <HomeIcon size={14} />}
                                            {expiresAt && <ExpiryRowIcon size={14} />}
                                            <Text fz="md" fw={500}>
                                                <VariantTitle group={group} variant={variant} />
                                            </Text>
                                            {expiresAt && (
                                                <Text size="xs" data-expiry-date>
                                                    {formatDateOnly(expiresAt)}
                                                </Text>
                                            )}
                                            {isPlain && datedCount > 0 && (
                                                <Badge size="xs" variant="light" color="gray">
                                                    +{datedCount}
                                                </Badge>
                                            )}
                                        </Group>
                                        <Group gap="xs">
                                            <Text fz="md" component="span">
                                                {home && (
                                                    <ApproxAmountIcon size={12} style={{ verticalAlign: 'middle' }} />
                                                )}
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
                                            isPlain && !hasSuspicious ? () => handleAddSuspicious(variant) : undefined
                                        }
                                        onAddHome={isPlain && !hasHome ? () => handleAddHome(variant) : undefined}
                                        onAddExpiry={isPlain ? (value) => handlePickExpiry(variant, value) : undefined}
                                    >
                                        <VariantImagePicker
                                            group={group}
                                            name={name}
                                            variant={variant}
                                            image={variantImage}
                                        />
                                    </AmountExpanded>
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
                                <AddIcon size={14} />
                                {option.label}
                            </Group>
                        ) : (
                            <Group gap={6} wrap="nowrap">
                                <VariantAvatar group={group} variant={option.value} />
                                <Text>
                                    <VariantTitle group={group} variant={option.label} />
                                </Text>
                            </Group>
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
                            leftSection={<UndoIcon size={16} />}
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
                            leftSection={<RedoIcon size={16} />}
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
                        <Button
                            variant="default"
                            size="sm"
                            leftSection={<CancelIcon size={16} />}
                            onClick={handleCancel}
                        >
                            <Label>Cancel</Label>
                        </Button>
                        <Button
                            size="sm"
                            leftSection={<UpdateIcon size={16} />}
                            onClick={handleUpdate}
                            disabled={!hasChanges || submitting}
                            loading={loading}
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
