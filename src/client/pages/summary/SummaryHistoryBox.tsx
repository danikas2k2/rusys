import { Center, Modal, type ModalProps } from '@mantine/core';
import React, { useCallback } from 'react';

import { UpdateTypeWrapper, type UpdateTypes } from '~/client/common/UpdateTypeContext';
import { UpdateTypeToggle } from '~/client/common/UpdateTypeToggle';
import { useLabels } from '~/client/hooks/useLabels';
import { SummaryHistoryTab } from '~/client/pages/summary/SummaryHistoryTab';

import './SummaryHistoryBox.pcss';

export interface SummaryHistoryBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
    initialUpdateType?: UpdateTypes;
}

export function SummaryHistoryBox({
    opened = false,
    title,
    onClose,
    onAfterClose,
    initialUpdateType = 'consumed',
}: SummaryHistoryBoxProps) {
    const _ = useLabels();

    const handleClose = useCallback(() => onClose?.(), [onClose]);
    const handleExitTransitionEnd = useCallback(() => onAfterClose?.(), [onAfterClose]);

    return (
        <Modal
            className="summary-history-box"
            fullScreen
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={title}
        >
            <UpdateTypeWrapper key={initialUpdateType} initialState={initialUpdateType}>
                <Center mt="sm">
                    <UpdateTypeToggle updated={false} />
                </Center>
                <SummaryHistoryTab />
            </UpdateTypeWrapper>
        </Modal>
    );
}
