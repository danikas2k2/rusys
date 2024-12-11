import React, { type HTMLAttributes, type RefAttributes, useCallback, useState } from 'react';
import { SlideControls } from '~/client/common/SlideControls';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { getErrorMessage } from '~/common/utils/errors';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';

interface DetailsControlsProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    group: string;
    name: string;
    onPin?: () => void;
    onUnpin?: (hide?: boolean) => void;
}

export function DetailsControls({ group, name, onPin, onUnpin, ...props }: DetailsControlsProps) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const onEdit = useCallback(() => setDialogVisible(true), []);

    const deleteDetails = useDeleteDetails();
    const onDelete = useCallback(async () => {
        onUnpin?.(true);
        try {
            await deleteDetails(group, name);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteDetails, group, name, onUnpin]);

    return group && name ? (
        <>
            <SlideControls onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} {...props} />
            {dialogVisible && (
                <DetailsBox
                    group={group}
                    name={name}
                    onClose={() => {
                        onUnpin?.();
                        setDialogVisible(false);
                    }}
                />
            )}
        </>
    ) : null;
}
