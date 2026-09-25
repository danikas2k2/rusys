import React, { useCallback, useEffect, useState } from 'react';

import { ProductsNavIcon } from '@icons';

import { DialogIcon } from '~/components/common/DialogIcon';
import { ProductPhotoPreview } from '~/components/products/ProductPhotoPreview';

export interface ProductDialogIconProps {
    photo?: string;
    'aria-label'?: string;
    onPhotoPreviewOpenChange?: (opened: boolean) => void;
}

export function ProductDialogIcon({
    photo,
    'aria-label': ariaLabel,
    onPhotoPreviewOpenChange,
}: ProductDialogIconProps): React.ReactElement {
    const [failed, setFailed] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the fallback when a new photo is given
    useEffect(() => setFailed(false), [photo]);

    const showPhoto = !!photo && !failed;
    const handlePhotoError = useCallback(() => {
        setFailed(true);
        onPhotoPreviewOpenChange?.(false);
    }, [onPhotoPreviewOpenChange]);

    if (showPhoto) {
        return <ProductPhotoPreview photo={photo} onError={handlePhotoError} onOpenChange={onPhotoPreviewOpenChange} />;
    }

    return (
        <DialogIcon aria-label={ariaLabel}>
            <ProductsNavIcon />
        </DialogIcon>
    );
}
