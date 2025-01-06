import CloseIcon from '@icons/Close.svg';
import ExpandDownIcon from '@icons/ExpandDown.svg';
import Button, { ButtonGroup } from '@ui/Button';
import Dialog from '@ui/Dialog';
import IconButton from '@ui/IconButton';
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
import Label from '~/client/Label';
import { type Amount, Variant } from '~/store/details/types';
import useAllVariants from '~/store/details/useAllVariants';
import useVariantComparator from '~/store/details/useVariantComparator';
import { type Name, type Year } from '~/store/types';
import cx from './ValueBox.less';

interface ValueBoxProps {
    name?: Name;
    year?: Year;
    value?: Amount;
    onClose?: (value?: Amount, updateWithoutHistory?: boolean) => void;
}

export default memo(function ValueBox({ name, year, value, onClose }: ValueBoxProps) {
    const [expanded, setExpanded] = useState(false);
    const [removed, setRemoved] = useState(false);

    const [editingValue, setEditingValue] = useState<Amount>();
    useEffect(() => {
        setEditingValue(value);
    }, [value]);

    const allVariants = useAllVariants();
    const cmpVariants = useVariantComparator();
    const editingKeys = useMemo((): Variant[] => {
        if (expanded) {
            return allVariants;
        }
        const keys = Object.keys(editingValue ?? {}).sort(cmpVariants) as Variant[];
        return keys.length ? keys : [Variant.PUSLITRIS];
    }, [allVariants, cmpVariants, editingValue, expanded]);

    useEffect(() => {
        if (editingValue) {
            const optimizedValue = {
                ...Object.fromEntries(Object.entries(editingValue).map(([k, v]) => [k, v < 0 ? 0 : v])),
            };
            if (!isEqual(editingValue, optimizedValue)) {
                setEditingValue(optimizedValue);
            }
            const editingKeys = Object.keys(editingValue);
            if (allVariants.every((k) => editingKeys.includes(k))) {
                setExpanded(true);
            }
        }
    }, [allVariants, editingValue]);

    const refs = useMemo(
        (): Partial<Record<Variant, RefObject<HTMLInputElement>>> =>
            Object.fromEntries(editingKeys.map((k) => [k, createRef()])),
        [editingKeys]
    );

    const [focused, setFocused] = useState<Variant>(editingKeys[0]);
    useEffect(() => {
        refs[focused]?.current?.focus();
    }, [focused, refs]);
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

    return (
        <Dialog
            className={cx('ValueBox', { fullScreen: expanded })}
            open
            closeOnOutsideClick
            closeOnEscape
            onClose={handleClose}
        >
            <header>
                <div className={cx('title')}>
                    <span>{name}</span>
                    <time>{year}</time>
                    <div className={cx('controls')}>
                        <ButtonGroup>
                            <Button
                                color={removed ? 'neutral' : 'positive'}
                                variant={removed ? 'outlined' : 'solid'}
                                onClick={handleItemsUsed}
                            >
                                <Label>Items used</Label>
                            </Button>
                            <Button
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
                    <IconButton onClick={handleClose}>
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
                        <Button onClick={handleExpand} variant="plain" color="primary" size="large">
                            <ExpandDownIcon />
                        </Button>
                    </div>
                )}
            </footer>
        </Dialog>
    );
}, isEqual);
