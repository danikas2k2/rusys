import { Checkbox, ClickAwayListener, TableCell, TableRow, TextField } from '@mui/material';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import React, { FocusEvent, KeyboardEvent, TouchEvent, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { SliderActions } from '~/SliderActions';
import { BaseState } from '~/store/base.types';
import { setNameAction, setValueAction } from '~/store/details.actions';
import { Name, Value, Values, Year } from '~/store/details.types';
import { disableEditingAction, enableEditingAction } from '~/store/editing.actions';
import { addMissingAction, removeMissingAction } from '~/store/missing.actions';
import { ValueCell } from '~/ValueCell';
import './ValueRow.css';

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

    const MIN_SLIDE_OFFSET = 0;
    const MAX_SLIDE_OFFSET = 50;
    const [slideOffset, setSlideOffset] = useState(0);
    const [touchStart, setTouchStart] = useState<number | undefined>(undefined);
    const [touchEnd, setTouchEnd] = useState<number | undefined>(undefined);
    const [touchOffset, setTouchOffset] = useState(0);

    return (
        <TableRow
            key={name}
            className="Row"
            role="checkbox"
            tabIndex={-1}
            aria-checked={!isMissing}
            selected={isMissing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
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
                className={classNames('Cell', {
                    'Cell--unavailable': isUnavailable && !editing,
                })}
                scope="row"
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
            <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleHideSlider}>
                <TableCell className="Slider" sx={{ width: `${slideOffset + touchOffset}vw` }}>
                    <SliderActions name={name} onClick={handleHideSlider} />
                </TableCell>
            </ClickAwayListener>
        </TableRow>
    );

    function handleRename() {
        dispatch(setNameAction(name, newName));
        dispatch(disableEditingAction());
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (newName) {
            if (e.key === 'Enter') {
                handleRename();
            } else if (e.key === 'Escape') {
                dispatch(disableEditingAction());
            }
        }
    }

    function handleBlur(e: FocusEvent<HTMLInputElement>) {
        if (newName) {
            handleRename();
        } else {
            e.currentTarget.focus();
        }
    }

    function handleMissing(name: string, isMissing: boolean) {
        if (isMissing) {
            dispatch(addMissingAction(name));
        } else {
            dispatch(removeMissingAction(name));
        }
    }

    function handleValue(name: string, year: Year, value?: Value) {
        dispatch(setValueAction(name, year, value));
        handleMissing(name, false);
    }

    function handleTouchStart({ touches }: TouchEvent) {
        const { clientX } = touches[0];
        setTouchStart(clientX);
        setTouchEnd(undefined);
    }

    function handleTouchMove({ touches }: TouchEvent) {
        if (touchStart != null) {
            const { clientX } = touches[0];
            setTouchEnd(clientX);
            setTouchOffset(Math.max(-MAX_SLIDE_OFFSET, Math.min(MAX_SLIDE_OFFSET, (touchStart - clientX) / 2)));
        }
    }

    function handleTouchEnd() {
        if (touchStart != null && touchEnd != null) {
            const touchDirection = touchStart - touchEnd;
            if (touchDirection > 0) {
                setSlideOffset(MAX_SLIDE_OFFSET);
            } else if (touchDirection < 0) {
                setSlideOffset(MIN_SLIDE_OFFSET);
            }
            setTouchOffset(0);
            setTouchStart(undefined);
        } else {
            handleHideSlider();
        }
    }

    function handleTouchCancel() {
        setTouchOffset(0);
        setTouchStart(undefined);
    }

    function handleHideSlider() {
        setSlideOffset(0);
    }
}
