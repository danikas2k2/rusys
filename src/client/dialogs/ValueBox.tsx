import CloseIcon from '@icons/Close.svg';
import ExpandDownIcon from '@icons/ExpandDown.svg';
import Button from '@ui/Button';
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
import ValueInput from '~/client/dialogs/ValueInput';
import { type Amount, Variant } from '~/store/details/types';
import useAllVariants from '~/store/details/useAllVariants';
import useVariantComparator from '~/store/details/useVariantComparator';
import { type Name, type Year } from '~/store/types';
import './ValueBox.less';

interface ValueBoxProps {
    name?: Name;
    year?: Year;
    value?: Amount;
    onClose?: (value?: Amount) => void;
}

export default memo(function ValueBox({ name, year, value, onClose }: ValueBoxProps) {
    const [expanded, setExpanded] = useState(false);

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
        onClose?.(editingValue);
    }, [editingValue, onClose]);

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
                    <span>{name}</span>
                    <time>{year}</time>
                </div>
                <div className="close">
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
                    <Button onClick={handleExpand} variant="plain" color="primary" size="large">
                        <ExpandDownIcon />
                    </Button>
                )}
            </footer>
        </Dialog>
    );
}, isEqual);
