import CloseIcon from '@icons/Close.svg';
import ExpandDownIcon from '@icons/ExpandDown.svg';
import { Button, ButtonGroup, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { isEqual } from 'lodash';
import React, {
    createRef,
    type RefObject,
    type SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { ValueInput } from '~/client/details/dialogs/ValueInput';
import { useLabel } from '~/client/hooks/useLabel';
import { Label } from '~/client/common/Label';
import { type VariantAmount } from '~/common/types';
import { useAllVariants } from '~/state/variants/useAllVariants';
import { useGroupVariantComparator } from '~/state/variants/useGroupVariantComparator';
import cx from './ValueBox.less';

export interface ValueBoxProps {
    group: string;
    name: string;
    year: number;
    amounts?: ReadonlyArray<VariantAmount>;
    onClose?: (amounts?: ReadonlyArray<VariantAmount>, withoutHistory?: boolean) => void;
}

// TODO refactor: extract single element with input element and all handlers to avoid multiple re-renders
export function ValueBox({ group, name, year, amounts, onClose }: ValueBoxProps) {
    const [expanded, setExpanded] = useState(false);
    const [removed, setRemoved] = useState(false);

    const [editingAmounts, setEditingAmounts] = useState(amounts);
    useEffect(() => setEditingAmounts(amounts), [amounts]);

    const allVariants = useAllVariants(group);
    const compareVariants = useGroupVariantComparator(group);
    const editingVariants = useMemo(() => {
        if (expanded) {
            return allVariants;
        }
        const variants = [...(editingAmounts ?? [])].map((v) => v.variant).sort(compareVariants);
        return variants.length ? variants : allVariants.slice(0, 1);
    }, [allVariants, compareVariants, editingAmounts, expanded]);

    useEffect(() => {
        if (editingAmounts) {
            const optimizedValue = editingAmounts.map(({ variant, amount }) => ({
                variant,
                amount: Math.max(0, amount),
            }));
            if (!isEqual(editingAmounts, optimizedValue)) {
                setEditingAmounts(optimizedValue);
            }
        }
    }, [editingAmounts]);

    useEffect(() => {
        if (editingVariants && allVariants.every((k) => editingVariants.includes(k))) {
            setExpanded(true);
        }
    }, [allVariants, editingVariants]);

    const refs = useMemo(
        (): Record<string, RefObject<HTMLInputElement>> =>
            Object.fromEntries(editingVariants.map((k) => [k, createRef()])),
        [editingVariants]
    );

    const [focused, setFocused] = useState<string>(editingVariants[0]);
    useEffect(() => refs[focused]?.current?.focus(), [focused, refs]);
    useEffect(() => {
        if (expanded) {
            refs[focused]?.current?.focus();
        }
    }, [expanded, focused, refs]);

    const handleClose = useCallback((): void => {
        setExpanded(false);
        onClose?.(editingAmounts, removed);
    }, [editingAmounts, onClose, removed]);

    const handleExpand = useCallback((): void => {
        setExpanded(true);
    }, []);

    const stopPropagation = useCallback((e: SyntheticEvent) => e.stopPropagation(), []);

    const handleChange = useCallback(
        (variant: string, newValue: number) =>
            setEditingAmounts(
                editingAmounts?.some((v) => v.variant === variant)
                    ? editingAmounts.map((v) => (v.variant !== variant ? v : { ...v, amount: newValue }))
                    : [...(editingAmounts ?? []), { variant, amount: newValue }]
            ),
        [editingAmounts]
    );

    const handleFocus = useCallback(
        (variant: string) => {
            if (variant !== focused) {
                setFocused(variant);
            }
        },
        [focused]
    );

    const handleItemsUsed = useCallback(() => {
        if (removed) {
            setRemoved(false);
        }
    }, [removed]);
    const handleItemsRemoved = useCallback(() => {
        if (!removed) {
            setRemoved(true);
        }
    }, [removed]);

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
                        <ButtonGroup>
                            <Button
                                role="radio"
                                aria-checked={!removed}
                                color={removed ? 'neutral' : 'positive'}
                                variant={removed ? 'outlined' : 'solid'}
                                onClick={handleItemsUsed}
                            >
                                <Label>Items used</Label>
                            </Button>
                            <Button
                                role="radio"
                                aria-checked={removed}
                                color={removed ? 'negative' : 'neutral'}
                                variant={removed ? 'solid' : 'outlined'}
                                onClick={handleItemsRemoved}
                            >
                                <Label>Items removed</Label>
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <article role="presentation" onClick={stopPropagation} onDoubleClick={stopPropagation}>
                {editingVariants.map((variant) => (
                    <ValueInput
                        key={variant}
                        ref={refs[variant]}
                        group={group}
                        variant={variant}
                        initialAmount={amounts?.find((v) => v.variant === variant)?.amount}
                        amount={editingAmounts?.find((v) => v.variant === variant)?.amount}
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
                            color="primary"
                            size="large"
                        >
                            <ExpandDownIcon />
                        </Button>
                    </div>
                )}
            </footer>
        </Dialog>
    );
}
