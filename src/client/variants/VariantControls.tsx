import React, { forwardRef, type HTMLAttributes, type Ref, useCallback, useState } from 'react';
import { SlideControls } from '~/client/common/SlideControls';
import { VariantBox } from '~/client/variants/dialogs/VariantBox';
import { getErrorMessage } from '~/common/utils/errors';
import { useDeleteVariant } from '~/state/variants/useDeleteVariant';

interface VariantControlsProps extends HTMLAttributes<HTMLDivElement> {
    group: string;
    variant: string;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export const VariantControls = forwardRef(function VariantControls(
    { group, variant, onPin, onUnpin, ...props }: VariantControlsProps,
    ref: Ref<HTMLDivElement>
) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const onEdit = useCallback(() => {
        setDialogVisible(true);
    }, []);

    const deleteVariant = useDeleteVariant();
    const onDelete = useCallback(async () => {
        onUnpin?.(true);
        try {
            await deleteVariant(group, variant);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(getErrorMessage(e));
            // setError(getErrorMessage(e));
        }
    }, [deleteVariant, group, onUnpin, variant]);

    return group && variant ? (
        <>
            <SlideControls ref={ref} onEdit={onEdit} onRemove={onDelete} onPin={onPin} onUnpin={onUnpin} {...props} />
            {dialogVisible && (
                <VariantBox
                    group={group}
                    variant={variant}
                    onClose={() => {
                        onUnpin?.();
                        setDialogVisible(false);
                    }}
                />
            )}
        </>
    ) : null;
});
