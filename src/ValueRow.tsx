import { Checkbox, ClickAwayListener, TableCell, TableRow, TextField } from '@mui/material';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import type { FocusEvent, KeyboardEvent, TouchEvent } from 'react';
import React, { memo, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { SliderActions } from '~/SliderActions';
import type { BaseState } from '~/store/base.types';
import { removeDetailsAction, setNameAction, setValueAction } from '~/store/details.actions';
import type { Name, Value, Values, Year } from '~/store/details.types';
import { disableEditingAction, enableEditingAction } from '~/store/editing.actions';
import { addMissingAction, removeMissingAction } from '~/store/missing.actions';
import { ValueCell } from '~/ValueCell';
import './ValueRow.css';

interface ValueRowProps {
    name: Name;
    values: Values;
    isMissing?: boolean;
}

export const ValueRow = memo(({ name, values, isMissing }: ValueRowProps) => {
    const dispatch = useDispatch();
    const [isEditing, forceEditing, years] = useSelector(
        (state: BaseState) =>
            [
                state.editing.enabled && state.editing.name === name,
                !state.editing.enabled && !name,
                state.years,
            ] as const,
        shallowEqual
    );

    const nameRef = useRef<HTMLDivElement>(null);
    const [newName, setNewName] = useState(name);
    useEffect(() => {
        if (forceEditing) {
            dispatch(enableEditingAction(name));
        }
    }, [dispatch, forceEditing, name]);

    const labelId = `checkbox-${name}`;
    const isUnavailable = isEmpty(values);

    const MIN_SLIDE_OFFSET = 0;
    const MAX_SLIDE_OFFSET = 50;
    const touchStartRef = useRef<number | undefined>(undefined);
    const touchEndRef = useRef<number | undefined>(undefined);
    const [slideOffset, setSlideOffset] = useState(0);
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
                    'Cell--unavailable': isUnavailable && !isEditing,
                })}
                scope="row"
                onClick={() => isUnavailable || handleMissing(name, !isMissing)}
                colSpan={isEditing ? years.length + 1 : undefined}
            >
                {isEditing ? (
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
            {!isEditing &&
                years.map((year) => (
                    <ValueCell
                        key={year}
                        value={values[year]}
                        isLast={year === years[years.length - 1]}
                        onChange={(value) => handleValue(name, year, value)}
                    />
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
        switch (e.key) {
            case 'Enter':
                if (newName) {
                    handleRename();
                }
                break;

            case 'Escape':
                if (!newName) {
                    dispatch(removeDetailsAction(name));
                }
                break;
        }
    }

    function handleBlur(__e: FocusEvent<HTMLInputElement>) {
        if (newName) {
            handleRename();
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
        touchStartRef.current = clientX;
        touchEndRef.current = undefined;
    }

    function handleTouchMove({ touches }: TouchEvent) {
        if (touchStartRef.current != null) {
            const { clientX } = touches[0];
            touchEndRef.current = clientX;
            const newTouchOffset = Math.max(
                -MAX_SLIDE_OFFSET,
                Math.min(MAX_SLIDE_OFFSET, (touchStartRef.current - clientX) / 2)
            );
            if (newTouchOffset !== touchOffset) {
                setTouchOffset(newTouchOffset);
            }
        }
    }

    function handleTouchEnd() {
        if (touchStartRef.current != null && touchEndRef.current != null) {
            const touchDirection = touchStartRef.current - touchEndRef.current;
            if (touchDirection > 0) {
                if (slideOffset !== MAX_SLIDE_OFFSET) {
                    setSlideOffset(MAX_SLIDE_OFFSET);
                }
            } else if (touchDirection < 0) {
                if (slideOffset !== MIN_SLIDE_OFFSET) {
                    setSlideOffset(MIN_SLIDE_OFFSET);
                }
            }
            if (touchOffset !== 0) {
                setTouchOffset(0);
            }
            touchStartRef.current = undefined;
        } else {
            handleHideSlider();
        }
    }

    function handleTouchCancel() {
        if (touchOffset !== 0) {
            setTouchOffset(0);
        }
        touchStartRef.current = undefined;
    }

    function handleHideSlider() {
        if (slideOffset !== 0) {
            setSlideOffset(0);
        }
    }
});
