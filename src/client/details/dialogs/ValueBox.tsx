import React, { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import DoneIcon from '@assets/done.svg';
import ExpandDownIcon from '@assets/expand-down.svg';
import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { Label } from '~/client/common/Label';
import { useRecycled } from '~/client/common/RecycledContext';
import { RecycledControls } from '~/client/common/RecycledControls';
import { ValueInput } from '~/client/details/dialogs/ValueInput';
import { getChangedAmount, getVariantAmount } from '~/client/details/utils/amounts';
import { useLabel } from '~/client/hooks/useLabel';
import { useAllVariants } from '~/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import { type VariantAmount } from '~/types/data';
import cx from './ValueBox.pcss';

export interface ValueBoxProps {
    group: string;
    name: string;
    year: number;
    amounts?: ReadonlyArray<VariantAmount>;
    onClose?: (changes?: ReadonlyArray<VariantAmount>) => void;
}

// TODO refactor: extract single element with input element and all handlers to avoid multiple re-renders
export function ValueBox({ group, name, year, amounts, onClose }: ValueBoxProps) {
    const [expanded, setExpanded] = useState(false);
    const allVariants = useAllVariants(group);
    const compareVariants = useGroupVariantComparator(group);
    const amountVariants = useMemo<string[]>(() => amounts?.map((v) => v.variant) ?? [], [amounts]);
    const editingVariants = useMemo(() => {
        if (expanded) {
            return allVariants;
        }
        const variants = amountVariants.sort(compareVariants);
        return variants.length ? variants : allVariants.slice(0, 1);
    }, [allVariants, amountVariants, compareVariants, expanded]);

    useEffect(() => {
        if (editingVariants?.length === allVariants.length) {
            setExpanded(true);
        }
    }, [allVariants, editingVariants]);

    const handleExpand = useCallback((): void => {
        setExpanded(true);
    }, []);

    const refs = useRef<Record<string, HTMLInputElement | null>>({});
    const [focused, setFocused] = useState<string>(editingVariants[0]);
    useEffect(() => refs.current[focused]?.focus(), [expanded, focused, refs]);

    const handleClose = useCallback((): void => {
        setExpanded(false);
        onClose?.();
    }, [onClose]);

    const [consumedChanges, setConsumedChanges] = useState<ReadonlyArray<VariantAmount>>([]);
    const [recycledChanges, setRecycledChanges] = useState<ReadonlyArray<VariantAmount>>([]);
    const handleUpdate = useCallback((): void => {
        setExpanded(false);
        onClose?.([...consumedChanges, ...recycledChanges.map((v) => ({ ...v, recycled: true }))]);
    }, [consumedChanges, onClose, recycledChanges]);

    const stopPropagation = useCallback((e: SyntheticEvent) => e.stopPropagation(), []);

    const [recycled] = useRecycled();
    const currentChanges = recycled ? recycledChanges : consumedChanges;
    const oppositeChanges = recycled ? consumedChanges : recycledChanges;
    const setChangingAmounts = recycled ? setRecycledChanges : setConsumedChanges;

    const handleChange = useCallback(
        (variant: string, change: number) => {
            const oldValue = getVariantAmount(amounts, variant);
            const oppositeChange = getVariantAmount(oppositeChanges, variant);
            const newValue = oldValue + change + oppositeChange;
            if (newValue >= 0) {
                setChangingAmounts(
                    currentChanges?.some((v) => v.variant === variant)
                        ? currentChanges.map((v) => (v.variant !== variant ? v : { ...v, amount: change }))
                        : [...(currentChanges ?? []), { variant, amount: change }]
                );
            }
        },
        [amounts, currentChanges, oppositeChanges, setChangingAmounts]
    );

    const handleFocus = useCallback(
        (variant: string) => {
            // TODO
            if (variant !== focused) {
                setFocused(variant);
            }
        },
        [focused]
    );

    const closeLabel = useLabel('Close');
    const expandLabel = useLabel('Expand');
    return (
        <Dialog
            className={cx('ValueBox')}
            open
            fullscreen={expanded}
            closeOnOutsideClick
            closeOnEscape
            onClose={handleClose}
        >
            <header>
                <div className={cx('title')}>
                    <div>{group}</div>
                    <div>{name}</div>
                    <time>{year}</time>
                    <div className={cx('controls')}>
                        <RecycledControls
                            consumedAmount={getChangedAmount(consumedChanges)}
                            recycledAmount={getChangedAmount(recycledChanges)}
                        />
                    </div>
                </div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <article
                className={cx('article', { recycled })}
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
                        focus={variant === focused}
                        onFocus={handleFocus}
                    />
                ))}
            </article>
            <footer>
                {!expanded && (
                    <div>
                        <Button
                            aria-label={expandLabel}
                            onClick={handleExpand}
                            variant="plain"
                            color="blue"
                            size="large"
                        >
                            <ExpandDownIcon />
                        </Button>
                    </div>
                )}
            </footer>
            <footer>
                <Button variant="outlined" startDecorator={<CancelIcon />} onClick={handleClose}>
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="blue" startDecorator={<DoneIcon />} onClick={handleUpdate}>
                    <Label>Update</Label>
                </Button>
            </footer>
        </Dialog>
    );
}
