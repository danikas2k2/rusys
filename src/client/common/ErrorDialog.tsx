import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Modal } from '@mantine/core';

import { Error } from '~/client/common/Error';
import { Label } from '~/client/common/Label';
import { clearErrorAction } from '~/client/state/error/actions';
import type { WithErrorState } from '~/client/state/error/types';

export function ErrorDialog(): React.ReactElement | null {
    const dispatch = useDispatch();
    const error = useSelector((state: WithErrorState) => state.error?.error);
    const handleClose = useCallback(() => dispatch(clearErrorAction()), [dispatch]);
    return (
        <Modal opened={!!error} onClose={handleClose} title={<Label>Error</Label>} centered>
            <Error>{error}</Error>
        </Modal>
    );
}
