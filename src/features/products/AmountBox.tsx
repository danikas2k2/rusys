import { ActionIcon, Group, Stack, Tabs, type ModalProps } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { EditIcon, HistoryTabIcon, QuantitiesTabIcon } from '@icons';

import { ConfirmableModal } from '~/components/common/ConfirmableModal';
import { Label } from '~/components/common/Label';
import { ProductDialogIcon } from '~/components/products/ProductDialogIcon';
import { AmountHistoryTab } from '~/features/products/AmountHistoryTab';
import { AmountVariantsTab } from '~/features/products/AmountVariantsTab';
import { ProductYearBar } from '~/features/products/ProductYearBar';
import { useLabels } from '~/lib/hooks/useLabels';

export interface ValueListBoxProps extends Pick<ModalProps, 'title'> {
    opened?: boolean;
    photo?: string;
    // Mantine's own Escape/click-outside handling is per-instance and unaware of other open
    // modals - when Edit/Delete opens right on top of this one (see ActiveAmountBox), both would
    // otherwise close together on a single Escape press. Default true (Mantine's own default);
    // callers stacking another dialog on top pass false for as long as that dialog is open.
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    onClose?: () => void;
    onAfterClose?: () => void;
    onEdit?: () => void;
}

export function AmountBox({
    opened = false,
    title,
    photo,
    closeOnEscape = true,
    closeOnClickOutside = true,
    onClose,
    onAfterClose,
    onEdit,
}: ValueListBoxProps) {
    const _ = useLabels();
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>('quantities');
    const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

    const handleExitTransitionEnd = useCallback(() => onAfterClose?.(), [onAfterClose]);

    return (
        <ConfirmableModal
            fullScreen
            opened={opened}
            withCloseButton
            isDirty={() => hasChanges}
            onClose={() => onClose?.()}
            closeOnEscape={closeOnEscape && !photoPreviewOpen}
            closeOnClickOutside={closeOnClickOutside}
            closeButtonProps={{ 'aria-label': _('Close') }}
            onExitTransitionEnd={handleExitTransitionEnd}
            title={
                <Group wrap="nowrap" gap="sm">
                    <ProductDialogIcon photo={photo} onPhotoPreviewOpenChange={setPhotoPreviewOpen} />
                    {title}
                </Group>
            }
            data-dialog="product"
        >
            {() => (
                <Stack className="amount-box-content" gap="sm">
                    <Group wrap="nowrap" gap="xs" align="flex-start">
                        {onEdit && (
                            <ActionIcon variant="subtle" color="gray" onClick={onEdit} aria-label={_('Edit')}>
                                <EditIcon size={18} />
                            </ActionIcon>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <ProductYearBar disabled={hasChanges} onHistoryYearChange={() => setActiveTab('history')} />
                        </div>
                    </Group>
                    <Tabs
                        className="amount-box-tabs"
                        variant="outline"
                        radius="sm"
                        value={activeTab}
                        onChange={setActiveTab}
                    >
                        <Tabs.List>
                            <Tabs.Tab fz="md" value="quantities" leftSection={<QuantitiesTabIcon size={18} />}>
                                <Label>Quantities</Label>
                            </Tabs.Tab>
                            <Tabs.Tab fz="md" value="history" leftSection={<HistoryTabIcon size={18} />}>
                                <Label>History</Label>
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel
                            className="amount-box-tab-panel amount-box-quantities-panel"
                            value="quantities"
                            pt="sm"
                        >
                            <AmountVariantsTab onChangesUpdate={setHasChanges} onClose={onClose} />
                        </Tabs.Panel>

                        <Tabs.Panel className="amount-box-tab-panel" value="history" pt="sm">
                            <AmountHistoryTab />
                        </Tabs.Panel>
                    </Tabs>
                </Stack>
            )}
        </ConfirmableModal>
    );
}
