import { Modal, Tabs, type ModalProps } from '@mantine/core';
import { IconHistory, IconStack2 } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { Label } from '~/client/common/Label';
import { useLabels } from '~/client/hooks/useLabels';
import { ValueHistoryTab } from '~/client/pages/products/ValueHistoryTab';
import { ValueQuantitiesTab } from '~/client/pages/products/ValueQuantitiesTab';

import './ValueListBox.pcss';

export interface ValueListBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
}

export function ValueListBox({ opened = false, title, onClose, onAfterClose }: ValueListBoxProps) {
    const _ = useLabels();

    const handleClose = useCallback(() => onClose?.(), [onClose]);

    const handleExitTransitionEnd = useCallback(() => {
        onAfterClose?.();
    }, [onAfterClose]);

    return (
        <Modal
            className="value-list-box"
            fullScreen
            opened={opened}
            withCloseButton
            onClose={handleClose}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={title}
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
                    <ValueQuantitiesTab />
                </Tabs.Panel>

                <Tabs.Panel value="history" pt="sm">
                    <ValueHistoryTab />
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
}
