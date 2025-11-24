import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Button, Center, Flex, Group, Modal, Stack, Title } from '@mantine/core';
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';

import { Label } from '~/client/common/Label';
import { useUpdateType, type UpdateTypes } from '~/client/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useLabels } from '~/client/hooks/useLabels';
import { ValueInput } from '~/client/pages/products/ValueInput';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { getVariantAmount } from '~/common/utils/amounts';
import type { ProductAmounts, VariantAmount } from '~/types/data';
import cx from './ValueBox.pcss';

export interface ValueBoxProps extends ProductAmounts {
    opened?: boolean;
    onClose?: (changes?: readonly VariantAmount[]) => void;
    onAfterClose?: () => void;
}

type UpdatingAmounts = Record<UpdateTypes, readonly VariantAmount[]>;

const NO_AMOUNTS: UpdatingAmounts = {
    consumed: [],
    updated: [],
    recycled: [],
};

// TODO refactor: extract single element with input element and all handlers to avoid multiple re-renders
export function ValueBox({ opened = false, group, name, year, amounts, onClose, onAfterClose }: ValueBoxProps) {
    const _ = useLabels();
    const allVariants = useAllVariants(group);
    const amountVariants = useMemo<string[]>(() => amounts?.map((v) => v.variant) ?? [], [amounts]);
    const compareVariants = useGroupVariantComparator(group);
    const availableVariants = useMemo(() => {
        const variants = amountVariants.sort(compareVariants);
        return variants.length ? variants : allVariants.slice(0, 1);
    }, [allVariants, amountVariants, compareVariants]);

    const [expanded, setExpanded] = useState(!!allVariants.length && allVariants.length === availableVariants.length);

    const editingVariants = expanded ? allVariants : availableVariants;

    const refs = useRef<Record<string, HTMLInputElement | null>>({});

    const [focused, setFocused] = useState<string | undefined>(editingVariants[0]);

    const currentlyFocused = focused ?? editingVariants[0];

    const handleFocus = useCallback(() => {
        refs.current[currentlyFocused]?.focus();
    }, [currentlyFocused]);

    const handleEnterTransitionEnd = useCallback(() => handleFocus(), [handleFocus]);

    const handleExpand = useCallback((): void => {
        setExpanded(true);
        handleFocus();
    }, [handleFocus]);

    const handleClose = useCallback((): void => {
        onClose?.();
    }, [onClose]);

    const [changes, setChanges] = useState(NO_AMOUNTS);

    const handleExitTransitionEnd = useCallback(() => {
        setExpanded(false);
        setFocused(undefined);
        setChanges(NO_AMOUNTS);
        onAfterClose?.();
    }, [onAfterClose]);

    const handleUpdate = useCallback((): void => {
        setExpanded(false);
        onClose?.([
            ...changes.updated,
            ...changes.consumed.map((v) => ({ ...v, recycled: false })),
            ...changes.recycled.map((v) => ({ ...v, recycled: true })),
        ]);
    }, [changes, onClose]);

    const stopPropagation = useCallback((e: React.SyntheticEvent) => e.stopPropagation(), []);

    const [currentVariant] = useUpdateType();
    const currentChanges = changes[currentVariant];
    const oppositeChanges = useMemo(
        () =>
            Object.entries(changes)
                .filter(([k]) => k !== currentVariant)
                .map(([, v]) => v)
                .flat(),
        [changes, currentVariant]
    );
    const setChangingAmounts = useCallback(
        (c: readonly VariantAmount[]) => setChanges((prev) => ({ ...prev, [currentVariant]: c })),
        [currentVariant]
    );

    const handleChange = useCallback(
        (variant: string, change: number) => {
            const oldValue = getVariantAmount(amounts, variant);
            const oppositeValue = getVariantAmount(oppositeChanges, variant);
            const newValue = oldValue + change + oppositeValue;
            if (newValue >= 0) {
                setChangingAmounts(
                    currentChanges.some((v) => v.variant === variant)
                        ? currentChanges.map((v) => (v.variant !== variant ? v : { ...v, amount: change }))
                        : [...(currentChanges ?? []), { variant, amount: change }]
                );
            }
        },
        [amounts, currentChanges, oppositeChanges, setChangingAmounts]
    );

    return (
        <Modal
            className={cx('ValueBox')}
            fullScreen={expanded}
            size="auto"
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onEnterTransitionEnd={handleEnterTransitionEnd}
            onExitTransitionEnd={handleExitTransitionEnd}
            styles={expanded ? { content: { width: '100vw' } } : undefined}
            title={
                <Stack gap={2}>
                    <Title order={4} fz="h2">
                        {name}
                    </Title>
                    <Title order={4} fz="lg">
                        {group}
                        {!!year && `, ${year}`}
                    </Title>
                    <Center mt="sm">
                        <UpdateTypeToggle changes={changes} />
                    </Center>
                </Stack>
            }
        >
            <div className={cx('content')} data-expanded={expanded}>
                <div
                    className={cx('article')}
                    data-variant={currentVariant}
                    role="presentation"
                    onClick={stopPropagation}
                    onDoubleClick={stopPropagation}
                >
                    {editingVariants.map((variant) => (
                        <ValueInput
                            key={variant}
                            ref={(ref) => {
                                refs.current[variant] = ref;
                            }}
                            variant={variant}
                            amount={getVariantAmount(amounts, variant) + getVariantAmount(oppositeChanges, variant)}
                            change={getVariantAmount(currentChanges, variant)}
                            onClose={handleClose}
                            onChange={handleChange}
                            onFocus={setFocused}
                            focused={variant === focused}
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

            <div className={cx('footer')}>
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
