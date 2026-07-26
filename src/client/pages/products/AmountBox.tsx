import { Modal, Tabs, type ModalProps } from '@mantine/core';
import { IconHistory, IconStack2 } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';

import { DiscardChangesDialog } from '~/client/common/DiscardChangesDialog';
import { Label } from '~/client/common/Label';
import { useConfirmClose } from '~/client/hooks/useConfirmClose';
import { useLabels } from '~/client/hooks/useLabels';
import { AmountHistoryTab } from '~/client/pages/products/AmountHistoryTab';
import { AmountVariantsTab } from '~/client/pages/products/AmountVariantsTab';

import './AmountBox.pcss';

export interface ValueListBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
}

export function AmountBox({ opened = false, title, onClose, onAfterClose }: ValueListBoxProps) {
    const _ = useLabels();
    const [hasChanges, setHasChanges] = useState(false);

    const { handleClose, confirming, handleConfirmDiscard, handleCancelDiscard } = useConfirmClose(
        () => hasChanges,
        () => onClose?.()
    );

    const handleExitTransitionEnd = useCallback(() => {
        onAfterClose?.();
    }, [onAfterClose]);

    return (
        <>
            <Modal
                fullScreen
                opened={opened}
                withCloseButton
                onClose={handleClose}
                closeButtonProps={{ 'aria-label': _('Close') }}
                onExitTransitionEnd={handleExitTransitionEnd}
                title={title}
                data-dialog="product"
            >
                <Tabs
                    variant="outline"
                    radius="sm"
                    defaultValue="quantities"
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                    <Tabs.List>
                        <Tabs.Tab fz="md" value="quantities" leftSection={<IconStack2 size={18} />}>
                            <Label>Quantities</Label>
                        </Tabs.Tab>
                        <Tabs.Tab fz="md" value="history" leftSection={<IconHistory size={18} />}>
                            <Label>History</Label>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="quantities" pt="sm">
                        <AmountVariantsTab onChangesUpdate={setHasChanges} />
                    </Tabs.Panel>

                    <Tabs.Panel value="history" pt="sm">
                        <AmountHistoryTab />
                    </Tabs.Panel>
                </Tabs>
            </Modal>
            <DiscardChangesDialog opened={confirming} onConfirm={handleConfirmDiscard} onClose={handleCancelDiscard} />
        </>
    );
}
