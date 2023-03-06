import AddCircleIcon from '@icons/AddCircle.svg';
import IconButton from '@ui/IconButton';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { enableEditingAction } from '~/store/editing/actions';

export default function AddButton(): JSX.Element {
    const dispatch = useDispatch();
    const onOpen = useCallback((): void => {
        dispatch(enableEditingAction(''));
    }, [dispatch]);

    return (
        <IconButton color="primary" onClick={onOpen}>
            <AddCircleIcon />
        </IconButton>
    );
}
