import { Checkbox, TableCell, TableRow, TextField } from '@mui/material';
import { isEmpty } from 'lodash';
import React, { FocusEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { BaseState } from '~/store/base.types';
import { setNameAction, setValueAction } from '~/store/details.actions';
import { Name, Value, Values, Year } from '~/store/details.types';
import { disableEditingAction, enableEditingAction } from '~/store/editing.actions';
import { addMissingAction, removeMissingAction } from '~/store/missing.actions';
import { ValueCell } from '~/ValueCell';

interface ValueRowProps {
    name: Name;
    values: Values;
    isMissing?: boolean;
}

export function ValueRow({ name, values, isMissing }: ValueRowProps) {
    const dispatch = useDispatch();
    const [isEditing, editing, years] = useSelector(
        (state: BaseState) =>
            [state.editing.enabled, state.editing.enabled && state.editing.name === name, state.years] as const,
        shallowEqual
    );

    const nameRef = useRef<HTMLDivElement>(null);
    const [newName, setNewName] = useState(name);
    useEffect(() => {
        if (!isEditing && name === '') {
            dispatch(enableEditingAction(name));
        }
    }, [dispatch, isEditing, name]);

    const labelId = `checkbox-${name}`;
    const isUnavailable = isEmpty(values);

    const handleRename = () => {
        dispatch(setNameAction(name, newName));
        dispatch(disableEditingAction());
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (newName) {
            if (e.key === 'Enter') {
                handleRename();
            } else if (e.key === 'Escape') {
                dispatch(disableEditingAction());
            }
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (newName) {
            handleRename();
        } else {
            e.currentTarget.focus();
        }
    };

    const handleMissing = (name: string, isMissing: boolean) => {
        if (isMissing) {
            dispatch(addMissingAction(name));
        } else {
            dispatch(removeMissingAction(name));
        }
    };

    const handleValue = (name: string, year: Year, value?: Value) => {
        dispatch(setValueAction(name, year, value));
        handleMissing(name, false);
    };

    return (
        <TableRow
            key={name}
            role="checkbox"
            tabIndex={-1}
            aria-checked={!isMissing}
            selected={isMissing}
            onTouchStart={() => console.info('onTouchStart')}
            onTouchEnd={() => console.info('onTouchEnd')}
            onTouchMove={() => console.info('onTouchMove')}
            onTouchCancel={() => console.info('onTouchCancel')}
        >
            <TableCell padding="checkbox" onClick={() => isUnavailable || handleMissing(name, !isMissing)}>
                <Checkbox
                    color="primary"
                    checked={!isMissing}
                    disabled={isUnavailable}
                    indeterminate={isUnavailable}
                    inputProps={{ 'aria-labelledby': labelId }}
                />
            </TableCell>
            <TableCell
                component="th"
                id={labelId}
                scope="row"
                padding="none"
                sx={{ textDecoration: isUnavailable && !editing ? 'line-through' : '' }}
                onClick={() => isUnavailable || handleMissing(name, !isMissing)}
                colSpan={editing ? years.length + 1 : undefined}
            >
                {editing ? (
                    <TextField
                        ref={nameRef}
                        color="primary"
                        variant="outlined"
                        fullWidth
                        defaultValue={name}
                        autoFocus
                        focused
                        onChange={(e) => setNewName(e.currentTarget.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                    />
                ) : (
                    name
                )}
            </TableCell>
            {!editing &&
                years.map((year) => (
                    <ValueCell key={year} value={values[year]} onChange={(value) => handleValue(name, year, value)} />
                ))}
        </TableRow>
    );
}
