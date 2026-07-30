import { Tabs, type ModalProps } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { HistoryTabIcon, ProductsNavIcon, QuantitiesTabIcon } from '@icons';

import { ConfirmableModal } from '~/client/common/ConfirmableModal';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
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

    const handleExitTransitionEnd = useCallback(() => {
        onAfterClose?.();
    }, [onAfterClose]);

    return (
        <ConfirmableModal
            fullScreen
            opened={opened}
            withCloseButton
            isDirty={() => hasChanges}
            onClose={() => onClose?.()}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={
                <>
                    <DialogIcon>
                        <ProductsNavIcon />
                    </DialogIcon>
                    {title}
                </>
            }
            data-dialog="product"
        >
            {() => (
                <Tabs
                    variant="outline"
                    radius="sm"
                    defaultValue="quantities"
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                    <Tabs.List>
                        <Tabs.Tab fz="md" value="quantities" leftSection={<QuantitiesTabIcon size={18} />}>
                            <Label>Quantities</Label>
                        </Tabs.Tab>
                        <Tabs.Tab fz="md" value="history" leftSection={<HistoryTabIcon size={18} />}>
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
            )}
        </ConfirmableModal>
    );
}
