import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, ButtonGroup, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import { isEqual } from 'lodash';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Value, Variant } from '~/store/details.types';
import { cmp } from '~/utils';

interface ValueCellProps {
    value?: Value;
    onChange: (value?: Value) => void;
}

export function ValueCell({ value, onChange }: ValueCellProps) {
    const [editing, setEditing] = useState(false);
    const [editingValue, setEditingValue] = useState(value);
    const allVariants = Object.values(Variant);
    const [expanded, setExpanded] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    const cmpVariants = <T extends any>(a: T, b: T) =>
        cmp(allVariants.indexOf(a as Variant), allVariants.indexOf(b as Variant));

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
    };

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
            onClick={editing ? undefined : handleOpen}
            onBlur={(e) => e.currentTarget.contains(e.relatedTarget as Node) || handleClose()}
        >
            {editing && (
                <Box
                    sx={{
                        position: 'absolute',
                        width: 150,
                        insetInlineStart: '50%',
                        marginInlineStart: '-75px',
                        marginBlockStart: '-1rem',
                        backgroundColor: 'white',
                        padding: '1rem 3rem 1rem 1rem',
                    }}
                    onBlur={(e) => e.currentTarget.contains(e.relatedTarget as Node) || handleClose()}
                >
                    {editingKeys.map((k, i) => {
                        const v = editingValue?.[k] ?? 0;
                        return (
                            <ButtonGroup key={k} variant="contained" sx={{ padding: '2px 0' }}>
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
