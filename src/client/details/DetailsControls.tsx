import React, { forwardRef, type HTMLAttributes, type Ref, useCallback, useState } from 'react';
import { SlideControls } from '~/client/common/SlideControls';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';
import { getErrorMessage } from '~/common/utils/errors';

interface DetailsControlsProps extends HTMLAttributes<HTMLDivElement> {
    group: string;
    name: string;
    onPin?: () => void;
    onUnpin?: (hide?: boolean) => void;
}

export const DetailsControls = forwardRef(function DetailsControls(
    { group, name, onPin, onUnpin, ...props }: DetailsControlsProps,
    ref: Ref<HTMLDivElement>
) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const onEdit = useCallback(() => setDialogVisible(true), []);

    const deleteDetails = useDeleteDetails();
    const onDelete = useCallback(async () => {
        onUnpin?.(true);
        try {
            await deleteDetails(group, name);
        } catch (e) {
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteDetails, group, name, onUnpin]);

    return group && name ? (
        <>
            <SlideControls ref={ref} onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} {...props} />
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
});
