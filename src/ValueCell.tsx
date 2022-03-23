import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, ButtonGroup, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import { SxProps } from '@mui/system';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BaseState } from '~/store/base.types';
import { Value, Variant } from '~/store/details.types';
import { cmp } from '~/utils';
import './ValueCell.css';

interface ValueCellProps {
    value?: Value;
    onChange: (value?: Value) => void;
}

export function ValueCell({ value, onChange }: ValueCellProps) {
    const isEditing = useSelector((state: BaseState) => state.editing.enabled);
    const [editing, setEditing] = useState(false);
    const [editingValue, setEditingValue] = useState(value);
    const [editingSx, setEditingSx] = useState<SxProps<Theme>>({});
    const allVariants = Object.values(Variant);
    const [expanded, setExpanded] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    const cmpVariants = <T extends any>(a: T, b: T) =>
        cmp(allVariants.indexOf(a as Variant), allVariants.indexOf(b as Variant));

    useEffect(() => {
        if (editing && isEditing) {
            setEditing(false);
        }
    }, [editing, isEditing]);

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

    useEffect(() => {
        if (editing || expanded) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [editing, expanded]);

    const handleOpen = () => {
        if (!isEqual(value, editingValue)) {
            setEditingValue(value);
        }
        setEditing(true);
        setEditingSx({ top: 0, left: '20vw', width: '80vw' });
    };

    const setBoxPosition = useCallback(() => {
        if (editingSx) {
            const { top, bottom, ...other } = editingSx as any;
            const { y = 0, height = 0 } = boxRef.current?.getBoundingClientRect() || {};
            if (bottom == null && window.innerHeight < y + height) {
                setEditingSx({ bottom: 0, ...other });
            }
            if (top == null && window.innerHeight > y + height * 2) {
                setEditingSx({ top: 0, ...other });
            }
        }
    }, [editingSx]);

    useEffect(() => {
        if (editing) {
            setBoxPosition();
        }
    }, [editing, setBoxPosition]);

    useEffect(() => {
        let scrolling = false;
        const scrollListener = () => {
            if (!scrolling) {
                window.requestAnimationFrame(() => {
                    setBoxPosition();
                    scrolling = false;
                });
                scrolling = true;
            }
        };
        if (editing) {
            window.addEventListener('scroll', scrollListener);
        }
        return () => {
            if (editing) {
                window.removeEventListener('scroll', scrollListener);
            }
        };
    }, [editing, setBoxPosition]);

    const handleClose = () => {
        setEditing(false);
        setExpanded(false);
        const optimizedValue = editingValue
            ? { ...Object.fromEntries(Object.entries(editingValue).filter(([, v]) => v > 0)) }
            : editingValue;
        if (!isEqual(value, optimizedValue)) {
            onChange(optimizedValue);
        }
    };

    const handleExpand = () => {
        setExpanded(true);
    };

    let editingKeys: Variant[] = [];
    if (expanded) {
        editingKeys = allVariants;
    } else if (editingValue) {
        editingKeys = Object.keys(editingValue).sort(cmpVariants) as Variant[];
    }
    if (!editingKeys.length) {
        editingKeys = [Variant.BASE];
    }

    return (
        <TableCell
            align="center"
            onClick={editing || isEditing ? undefined : handleOpen}
            onBlur={(e) => e.currentTarget.contains(e.relatedTarget as Node) || handleClose()}
        >
            {editing && (
                <Box
                    ref={boxRef}
                    className="EditingBox"
                    onBlur={(e) => e.currentTarget.contains(e.relatedTarget as Node) || handleClose()}
                    sx={editingSx}
                >
                    {editingKeys.map((k, i) => {
                        const v = editingValue?.[k] ?? 0;
                        return (
                            <ButtonGroup key={k} variant="contained" className="ButtonGroup">
                                {(expanded || k || (editingValue && Object.keys(editingValue).length > 1)) && (
                                    <Button variant="text" disabled>
                                        {k}
                                    </Button>
                                )}
                                <Button onClick={() => setEditingValue({ ...(editingValue || {}), [k]: v - 1 })}>
                                    <RemoveIcon />
                                </Button>
                                <TextField
                                    autoFocus={!i}
                                    inputRef={i ? undefined : inputRef}
                                    hiddenLabel
                                    variant="filled"
                                    value={v}
                                    inputMode="numeric"
                                    onChange={(e) => {
                                        const newValue = +e.currentTarget.value;
                                        if (!isNaN(newValue)) {
                                            setEditingValue({ ...(editingValue || {}), [k]: newValue });
                                        }
                                    }}
                                />
                                <Button onClick={() => setEditingValue({ ...(editingValue || {}), [k]: v + 1 })}>
                                    <AddIcon />
                                </Button>
                            </ButtonGroup>
                        );
                    })}
                    {!expanded && (
                        <Button onClick={handleExpand}>
                            <ExpandCircleDownIcon />
                        </Button>
                    )}
                    <Button onClick={handleClose}>
                        <CancelIcon />
                    </Button>
                </Box>
            )}
            {(value &&
                Object.entries(value)
                    .sort(([a], [b]) => cmpVariants(a, b))
                    .map(([k, v]) => `${v}${k}`)
                    .join(', ')) ||
                '.'}
        </TableCell>
    );
}
