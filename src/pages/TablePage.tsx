import React, { type JSX, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditBox from '~/client/dialogs/EditBox';
import Table from '~/client/table/Table';
import Toolbar from '~/client/toolbar/Toolbar';
import { type BaseState } from '~/store/base/types';
import { disableEditingAction } from '~/store/editing/actions';

export default function TablePage(): JSX.Element {
    const editing = useSelector((state: BaseState) => state.editing);

    const dispatch = useDispatch();
    const onClose = useCallback((): void => {
        dispatch(disableEditingAction());
    }, [dispatch]);

    return (
        <>
            <Toolbar />
            <Table />
            {editing.enabled && <EditBox onClose={onClose} name={editing.name} />}
        </>
    );
}
