import { Button, Center, Flex, Group, Modal, NumberInput, Select, Stack, Text } from '@mantine/core';
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Label } from '~/client/common/Label';
import { useUpdateType, type UpdateTypes } from '~/client/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useLabels } from '~/client/hooks/useLabels';
import { EmailAvatar } from '~/client/pages/history/EmailAvatar';
import { AmountInput } from '~/client/pages/products/AmountInput';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useGroups } from '~/client/state/groups/useGroups';
import { useGetProducts } from '~/client/state/products/useGetProducts';
import { useProducts } from '~/client/state/products/useProducts';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { getVariantAmount } from '~/common/utils/amounts';
import type { History, UserProfile, VariantAmount } from '~/types/data';

import './HistoryBox.pcss';

type EditingAmounts = Record<UpdateTypes, readonly VariantAmount[]>;

const EMPTY_EDIT: EditingAmounts = {
    consumed: [],
    updated: [],
    recycled: [],
};

function splitChanges(amounts: readonly VariantAmount[]): EditingAmounts {
    const consumed: VariantAmount[] = [];
    const recycled: VariantAmount[] = [];
    const updated: VariantAmount[] = [];

    for (const a of amounts ?? []) {
        if (!a?.variant || !a.amount) continue;
        if (a.recycled) recycled.push({ variant: a.variant, amount: a.amount });
        else consumed.push({ variant: a.variant, amount: a.amount });
    }

    return { consumed, recycled, updated };
}

function mergeChanges(changes: EditingAmounts): VariantAmount[] {
    const consumed = (changes.consumed ?? [])
        .filter((a) => a.variant && a.amount !== 0)
        .map((a) => ({ ...a, recycled: false }));
    const recycled = (changes.recycled ?? [])
        .filter((a) => a.variant && a.amount !== 0)
        .map((a) => ({ ...a, recycled: true }));
    return [...consumed, ...recycled];
}

function formatEntryDateTime(time: number): string {
    const d = new Date(time);
    const date = d.toLocaleDateString('lt-LT', { month: 'long', day: 'numeric' });
    const hm = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${hm}`;
}

export function HistoryBox({
    opened,
    item,
    userProfile,
    onClose,
    onAfterClose,
}: {
    opened: boolean;
    item: History;
    userProfile?: UserProfile;
    onClose: (next?: { group: string; name: string; year: number; amounts: readonly VariantAmount[] }) => void;
    onAfterClose?: () => void;
}): React.ReactElement {
    const _ = useLabels();
    const { time } = item;

    const groups = useGroups();
    const products = useProducts();
    const getGroups = useGetGroups();
    const getProducts = useGetProducts();

    const [expanded, setExpanded] = useState(false);
    const handleExpand = useCallback(() => setExpanded(true), []);

    const [group, setGroup] = useState(item.group);
    const [name, setName] = useState(item.name);
    const [year, setYear] = useState<number>(item.year || new Date(item.time).getFullYear());

    const [changes, setChanges] = useState<EditingAmounts>(() => splitChanges(item.amounts ?? []));
    const [updateType, setUpdateType] = useUpdateType();

    // Ensure reference data is loaded when the box opens
    React.useEffect(() => {
        if (!opened) return;
        if (!groups.length) void getGroups();
        if (!products.length) void getProducts();
    }, [getGroups, getProducts, groups.length, opened, products.length]);

    // Reset on open / item change
    React.useEffect(() => {
        if (!opened) return;
        setExpanded(false);
        setGroup(item.group);
        setName(item.name);
        setYear(item.year || new Date(item.time).getFullYear());
        const nextChanges = splitChanges(item.amounts ?? []);
        setChanges(nextChanges);
        // Default tab: if only recycled exists (no consumed), open recycled tab.
        if (!nextChanges.consumed.length && nextChanges.recycled.length && updateType !== 'recycled') {
            setUpdateType('recycled');
        }
    }, [item.amounts, item.group, item.name, item.time, item.year, opened]);

    const groupOptions = useMemo(() => groups.map((g) => g.group), [groups]);

    const nameOptions = useMemo(() => {
        const list = products.filter((p) => p.group === group).map((p) => p.name);
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }, [group, products]);

    // Keep name valid when group changes
    React.useEffect(() => {
        if (!opened) return;
        if (!name) return;
        if (nameOptions.length && !nameOptions.includes(name)) {
            setName(nameOptions[0] ?? '');
        }
    }, [name, nameOptions, opened]);

    const allVariants = useAllVariants(group);
    const compareVariants = useGroupVariantComparator(group);

    const amountVariants = useMemo(() => mergeChanges(changes).map((v) => v.variant), [changes]);
    const availableVariants = useMemo(() => {
        const variants = [...amountVariants].sort(compareVariants);
        return variants.length ? variants : allVariants.slice(0, 1);
    }, [allVariants, amountVariants, compareVariants]);

    const editingVariants = expanded ? allVariants : availableVariants;
    const refs = useRef<Record<string, HTMLInputElement | null>>({});

    const [focused, setFocused] = useState<string | undefined>(undefined);

    const [currentVariant] = useUpdateType();
    const currentChanges = changes[currentVariant] ?? [];

    const setChanging = useCallback(
        (next: readonly VariantAmount[]) => setChanges((prev) => ({ ...prev, [currentVariant]: next })),
        [currentVariant]
    );

    const handleChange = useCallback(
        (variant: string, value: number) => {
            const next = currentChanges.some((v) => v.variant === variant)
                ? currentChanges.map((v) => (v.variant !== variant ? v : { ...v, amount: value }))
                : [...currentChanges, { variant, amount: value }];
            setChanging(next.filter((v) => v.amount !== 0));
        },
        [currentChanges, setChanging]
    );

    const handleClose = useCallback(() => onClose(undefined), [onClose]);

    const handleUpdate = useCallback(() => {
        if (!group || !name || !year) {
            return;
        }
        onClose({ group, name, year, amounts: mergeChanges(changes) });
    }, [changes, group, name, onClose, year]);

    const dateLine = useMemo(() => formatEntryDateTime(time), [time]);

    const title = useMemo(
        () => (
            <Stack gap={6}>
                <Group justify="center" gap="sm">
                    <EmailAvatar email={item.user} profile={userProfile} />
                    <Text size="sm" fw={600}>
                        {dateLine}
                    </Text>
                </Group>
                <Center>
                    <UpdateTypeToggle updated={false} changes={changes} />
                </Center>
            </Stack>
        ),
        [changes, dateLine, item.user, userProfile]
    );

    const handleExitTransitionEnd = useCallback(() => {
        onAfterClose?.();
    }, [onAfterClose]);

    return (
        <Modal
            className="value-box history-box"
            fullScreen={expanded}
            size="auto"
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={title}
        >
            <Stack>
                <Select
                    label={<Label>Group</Label>}
                    data={groupOptions}
                    value={group}
                    onChange={(v) => setGroup(v ?? '')}
                    withAsterisk
                    searchable
                />
                <Select
                    label={<Label>Name</Label>}
                    data={nameOptions}
                    value={name}
                    onChange={(v) => setName(v ?? '')}
                    withAsterisk
                    searchable
                />
                <NumberInput
                    label={<Label>Year</Label>}
                    value={year}
                    onChange={(v) => setYear(typeof v === 'number' ? v : 0)}
                    withAsterisk
                    allowDecimal={false}
                    allowNegative={false}
                    min={1}
                />
            </Stack>

            <div className="content" data-expanded={expanded}>
                <div className="article" data-variant={currentVariant} role="presentation">
                    {editingVariants.map((variant) => (
                        <AmountInput
                            key={variant}
                            ref={(ref) => {
                                refs.current[variant] = ref;
                            }}
                            variant={variant}
                            amount={0}
                            change={getVariantAmount(currentChanges, variant)}
                            onClose={() => undefined}
                            onChange={handleChange}
                            onFocus={setFocused}
                            focused={variant === focused}
                            allowNegative
                        />
                    ))}
                </div>
                {!expanded && (
                    <Flex justify="center">
                        <Button
                            variant="subtle"
                            color="text"
                            leftSection={<IconChevronDown size={18} />}
                            onClick={handleExpand}
                        >
                            <Label>Expand</Label>
                        </Button>
                    </Flex>
                )}
            </div>

            <div className="footer">
                <Group justify="center">
                    <Button variant="outline" color="gray" leftSection={<IconX size={18} />} onClick={handleClose}>
                        <Label>Cancel</Label>
                    </Button>
                    <Button onClick={handleUpdate} leftSection={<IconCheck size={18} />}>
                        <Label>Update</Label>
                    </Button>
                </Group>
            </div>
        </Modal>
    );
}
