import CloseIcon from '@icons/Close.svg';
import ExpandDownIcon from '@icons/ExpandDown.svg';
import Button, { ButtonGroup } from '@ui/Button';
import Dialog from '@ui/Dialog';
import IconButton from '@ui/IconButton';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, {
    createRef,
    memo,
    type RefObject,
    type SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import ValueInput from '~/client/details/dialogs/ValueInput';
import { useLabel } from '~/client/hooks/useLabel';
import Label from '~/client/Label';
import { type Amount, Variant } from '~/state/details/types';
import { type Group, type Name, type Year } from '~/state/types';
import { useAllVariants } from '~/state/variants/useAllVariants';
import { useVariantComparator } from '~/state/variants/useVariantComparator';
import './ValueBox.less';

interface ValueBoxProps {
    group?: Group;
    name?: Name;
    year?: Year;
    value?: Amount;
    onClose?: (value?: Amount, updateWithoutHistory?: boolean) => void;
}

// TODO refactor: extract single element with input element and all handlers to avoid multiple rerenders
export default memo(function ValueBox({ group, name, year, value, onClose }: ValueBoxProps) {
    const [expanded, setExpanded] = useState(false);
    const [removed, setRemoved] = useState(false);

    const [editingValue, setEditingValue] = useState(value);
    useEffect(() => setEditingValue(value), [value]);

    const allVariants = useAllVariants();
    const compareVariants = useVariantComparator();
    const editingKeys = useMemo((): Variant[] => {
        if (expanded) {
            return allVariants;
        }
        const keys = Object.keys(editingValue ?? {}).sort(compareVariants) as Variant[];
        return keys.length ? keys : [Variant.PUSLITRIS];
    }, [allVariants, compareVariants, editingValue, expanded]);

    useEffect(() => {
        if (editingValue) {
            const optimizedValue = {
                ...Object.fromEntries(Object.entries(editingValue).map(([k, v]) => [k, v < 0 ? 0 : v])),
            };
            if (!isEqual(editingValue, optimizedValue)) {
                setEditingValue(optimizedValue);
            }
        }
    }, [editingValue]);

    useEffect(() => {
        if (editingValue && allVariants.every((k) => k in editingValue)) {
            setExpanded(true);
        }
    }, [allVariants, editingValue]);

    const refs = useMemo(
        (): Partial<Record<Variant, RefObject<HTMLInputElement>>> =>
            Object.fromEntries(editingKeys.map((k) => [k, createRef()])),
        [editingKeys]
    );

    const [focused, setFocused] = useState<Variant>(editingKeys[0]);
    useEffect(() => refs[focused]?.current?.focus(), [focused, refs]);
    useEffect(() => {
        if (expanded) {
            refs[focused]?.current?.focus();
        }
    }, [expanded, focused, refs]);

    const handleClose = useCallback((): void => {
        setExpanded(false);
        onClose?.(editingValue, removed);
    }, [editingValue, onClose, removed]);

    const handleExpand = useCallback((): void => {
        setExpanded(true);
    }, []);

    const stopPropagation = useCallback((e: SyntheticEvent) => e.stopPropagation(), []);

    const handleChange = useCallback(
        (k: Variant) =>
            (newValue: number): void =>
                setEditingValue({
                    ...editingValue,
                    [k]: newValue,
                }),
        [editingValue]
    );

    const handleFocus = useCallback(
        (k: Variant) => (): void => {
            if (k !== focused) {
                setFocused(k);
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
            className={classNames('ValueBox', { fullScreen: expanded })}
            open
            closeOnOutsideClick
            closeOnEscape
            onClose={handleClose}
        >
            <header>
                <div className="title">
                    <div>{group}</div>
                    <div>{name}</div>
                    <time>{year}</time>
                    <div className="controls">
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
                <div className="close">
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <article role="presentation" onClick={stopPropagation} onDoubleClick={stopPropagation}>
                {editingKeys.map((k) => (
                    <ValueInput
                        key={k}
                        ref={refs[k]}
                        variant={k}
                        prevValue={value?.[k]}
                        value={editingValue?.[k]}
                        onClose={handleClose}
                        onChange={handleChange(k)}
                        focus={k === focused}
                        onFocus={handleFocus(k)}
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
}, isEqual);
