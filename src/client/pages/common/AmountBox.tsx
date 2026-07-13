import { ActionIcon, Button, Center, Flex, Group, Modal, type ModalProps } from '@mantine/core';
import { IconArrowBackUp, IconArrowForwardUp, IconCheck, IconChevronDown, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Label } from '~/client/common/Label';
import { useUpdateType, type UpdateTypes } from '~/client/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountInput } from '~/client/pages/products/AmountInput';
import { useAllVariants } from '~/client/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { getVariantAmount } from '~/common/utils/amounts';
import type { GroupAmounts, VariantAmount } from '~/types/data';

import './AmountBox.pcss';

export interface AmountBoxProps extends GroupAmounts, Pick<ModalProps, 'title'> {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
    onSubmit?: (changes: readonly VariantAmount[]) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

type UpdatingAmounts = Record<UpdateTypes, readonly VariantAmount[]>;

const NO_AMOUNTS: UpdatingAmounts = {
    consumed: [],
    updated: [],
    recycled: [],
};

export function AmountBox({
    opened = false,
    title,
    group,
    amounts,
    onSubmit,
    onClose,
    onAfterClose,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    children,
}: React.PropsWithChildren<AmountBoxProps>) {
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

    const handleUpdate = useCallback(
        (e: React.SubmitEvent): void => {
            e.preventDefault();
            setExpanded(false);
            onSubmit?.([
                ...changes.updated,
                ...changes.consumed.map((v) => ({ ...v, recycled: false })),
                ...changes.recycled.map((v) => ({ ...v, recycled: true })),
            ]);
        },
        [changes, onSubmit]
    );

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
            className="value-box"
            fullScreen={expanded}
            size="auto"
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onEnterTransitionEnd={handleEnterTransitionEnd}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={title}
        >
            <form onSubmit={handleUpdate}>
                <Center mt="sm">
                    <UpdateTypeToggle changes={changes} />
                </Center>

                {children}

                <div className="content" data-expanded={expanded}>
                    <div
                        className="article"
                        data-variant={currentVariant}
                        role="presentation"
                        onClick={stopPropagation}
                        onDoubleClick={stopPropagation}
                    >
                        {editingVariants.map((variant) => (
                            <AmountInput
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

                <div className="footer">
                    <Group justify="center">
                        {(canUndo || canRedo) && (
                            <ActionIcon.Group>
                                <ActionIcon
                                    variant="default"
                                    size="lg"
                                    aria-label="Undo"
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                >
                                    <IconArrowBackUp size={18} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="default"
                                    size="lg"
                                    aria-label="Redo"
                                    onClick={onRedo}
                                    disabled={!canRedo}
                                >
                                    <IconArrowForwardUp size={18} />
                                </ActionIcon>
                            </ActionIcon.Group>
                        )}
                        <ActionIcon
                            type="reset"
                            variant="outline"
                            color="gray"
                            size="lg"
                            aria-label="Cancel"
                            onClick={handleClose}
                        >
                            <IconX size={18} />
                        </ActionIcon>
                        <Button type="submit" leftSection={<IconCheck size={18} />}>
                            <Label>Update</Label>
                        </Button>
                    </Group>
                </div>
            </form>
        </Modal>
    );
}
