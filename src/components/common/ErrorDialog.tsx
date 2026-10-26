import { Modal } from '@mantine/core';
import React, { useCallback } from 'react';

import { PageErrorIcon } from '@icons';

import { DialogIcon } from '~/components/common/DialogIcon';
import { Error } from '~/components/common/Error';
import { useDialogTracking } from '~/components/common/useUsageTracking';
import { useLabels } from '~/lib/hooks/useLabels';
import { getErrorMessage } from '~/lib/utils/errors';
import { useError } from '~/store/error/useError';

export function ErrorDialog(): React.ReactElement | null {
    const error = useError((state) => state.error);
    useDialogTracking('error', !!error);
    const _ = useLabels();
    const clearError = useError((state) => state.clearError);
    const handleClose = useCallback(() => clearError(), [clearError]);
    return (
        <Modal
            opened={!!error}
            onClose={handleClose}
            title={
                <DialogIcon aria-label={_('Error')}>
                    <PageErrorIcon />
                </DialogIcon>
            }
            centered
        >
            <Error>{error ? _(getErrorMessage(error)) : null}</Error>
        </Modal>
    );
}
