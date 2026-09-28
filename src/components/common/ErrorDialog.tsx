import { Modal } from '@mantine/core';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { PageErrorIcon } from '@icons';

import { DialogIcon } from '~/components/common/DialogIcon';
import { Error } from '~/components/common/Error';
import { useLabel } from '~/lib/hooks/useLabel';
import { clearErrorAction } from '~/store/error/actions';
import type { WithErrorState } from '~/store/error/types';

export function ErrorDialog(): React.ReactElement | null {
    const dispatch = useDispatch();
    const error = useSelector((state: WithErrorState) => state.error?.error);
    const handleClose = useCallback(() => dispatch(clearErrorAction()), [dispatch]);
    return (
        <Modal
            opened={!!error}
            onClose={handleClose}
            title={
                <DialogIcon aria-label={useLabel('Error')}>
                    <PageErrorIcon />
                </DialogIcon>
            }
            centered
        >
            <Error>{error}</Error>
        </Modal>
    );
}
