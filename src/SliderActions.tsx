import { Box, Button, ButtonGroup } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { ButtonWithConfirmation } from '~/ButtonWithConfirmation';
import { Label } from '~/Label';
import { removeDetailsAction } from '~/store/details.actions';
import { Name } from '~/store/details.types';
import { enableEditingAction } from '~/store/editing.actions';
import './SliderActions.css';

interface SliderActionsProps {
    name: Name;
    onClick?: () => void;
}

export function SliderActions({ name, onClick }: SliderActionsProps) {
    const dispatch = useDispatch();

    return (
        <Box className="Actions">
            <ButtonGroup className="ButtonGroup">
                <Button variant="contained" color="primary" className="Button" onClick={onEdit}>
                    <Label>Edit</Label>
                </Button>
                <ButtonWithConfirmation
                    variant="contained"
                    color="error"
                    className="Button"
                    onClick={onDelete}
                    confirm={<Label>Sure to remove?</Label>}
                >
                    <Label>Remove</Label>
                </ButtonWithConfirmation>
            </ButtonGroup>
        </Box>
    );

    function onEdit() {
        dispatch(enableEditingAction(name));
        onClick?.();
    }

    function onDelete() {
        dispatch(removeDetailsAction(name));
        onClick?.();
    }
}
