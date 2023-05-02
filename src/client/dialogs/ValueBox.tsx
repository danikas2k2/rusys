import AddIcon from '@icons/Add.svg';
import CloseIcon from '@icons/Close.svg';
import ExpandDownIcon from '@icons/ExpandDown.svg';
import RemoveIcon from '@icons/Remove.svg';
import Button from '@ui/Button';
import ButtonGroup from '@ui/ButtonGroup';
import Dialog from '@ui/Dialog';
import useAutoFocus from '@ui/hooks/useAutoFocus';
import IconButton from '@ui/IconButton';
import Input from '@ui/Input';
import { isEqual } from 'lodash';
import React, { type KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import ValueVariant from '~/client/ValueVariant';
import { type Name, type Value, Variant, type Year } from '~/store/details/types';
import useAllVariants from '~/store/details/useAllVariants';
import useVariantComparator from '~/store/details/useVariantComparator';
import { stopPropagation } from '~/utils/events';
import './ValueBox.less';

interface ValueBoxProps {
    name?: Name;
    year?: Year;
    value?: Value;
    onClose?: (value?: Value) => void;
}

export default function ValueBox({ name, year, value, onClose }: ValueBoxProps): JSX.Element {
    const [expanded, setExpanded] = useState(false);

    const [editingValue, setEditingValue] = useState<Value>();
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

    const focusRef = useAutoFocus<HTMLInputElement>();
    useEffect(() => {
        if (expanded) {
            focusRef?.focus();
        }
    }, [expanded, focusRef]);

    const handleClose = useCallback((): void => {
        setExpanded(false);
        onClose?.(editingValue);
    }, [editingValue, onClose]);

    const handleExpand = useCallback((): void => {
        setExpanded(true);
    }, []);

    return (
        <Dialog className="ValueBox" open closeOnOutsideClick closeOnEscape onClose={handleClose}>
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
            <div>
                {editingKeys.map((k, i) => {
                    const v = editingValue?.[k] ?? 0;
                    const onEnter = stopPropagation((e: KeyboardEvent) => {
                        if (e.key === 'Enter') {
                            handleClose();
                        }
                    });
                    const decrease = () => setEditingValue({ ...editingValue, [k]: v - 1 });
                    const increase = () => setEditingValue({ ...editingValue, [k]: v + 1 });
                    const onKeyDown = stopPropagation((e: KeyboardEvent) => {
                        switch (e.key) {
                            case 'Enter':
                                handleClose();
                                break;

                            case 'ArrowDown':
                                decrease();
                                break;

                            case 'ArrowUp':
                                increase();
                                break;
                        }
                    });
                    return (
                        <ButtonGroup key={k} className="row">
                            <div className="label">
                                <ValueVariant variant={k as Variant} format="long" />
                            </div>
                            <Input
                                ref={i ? undefined : focusRef}
                                className="value"
                                color="primary"
                                size="large"
                                inputMode="numeric"
                                value={v}
                                onChange={(e) => {
                                    const newValue = +e.currentTarget.value;
                                    if (!isNaN(newValue)) {
                                        setEditingValue({ ...editingValue, [k]: newValue });
                                    }
                                }}
                                onKeyDown={onKeyDown}
                                startDecorator={
                                    <Button
                                        onClick={decrease}
                                        onKeyDown={onEnter}
                                        variant="plain"
                                        color="primary"
                                        spacing="half"
                                    >
                                        <RemoveIcon />
                                    </Button>
                                }
                                endDecorator={
                                    <Button
                                        onClick={increase}
                                        onKeyDown={onEnter}
                                        variant="plain"
                                        color="primary"
                                        spacing="half"
                                    >
                                        <AddIcon />
                                    </Button>
                                }
                            />
                        </ButtonGroup>
                    );
                })}
            </div>
            <footer>
                {!expanded && (
                    <Button onClick={handleExpand} variant="plain" color="primary" size="large">
                        <ExpandDownIcon />
                    </Button>
                )}
            </footer>
        </Dialog>
    );
}
