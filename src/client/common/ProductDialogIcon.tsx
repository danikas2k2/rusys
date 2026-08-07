import React, { useEffect, useState } from 'react';

import { ProductsNavIcon } from '@icons';

import { DialogIcon } from '~/client/common/DialogIcon';

export interface ProductDialogIconProps {
    image?: string;
    // The original, larger photo - present only when `image` (the icon-sized derivative) has one.
    // A form's in-progress edit never has this (it only ever tracks the one pending `image` url/
    // data: URL), so it's omitted there.
    photo?: string;
    'aria-label'?: string;
}

// Same oversized, blurred watermark DialogIcon has always shown - just the product's own photo
// instead of the generic icon, once it has one. Deliberately not distinguishing icon vs photo
// mode here (unlike the grid tile): the watermark crops and blurs everything the same way
// regardless of the source image's own aspect ratio, so there's nothing to tell apart. Prefers
// the bigger photo over the icon-sized image when both exist.
export function ProductDialogIcon({
    image,
    photo,
    'aria-label': ariaLabel,
}: ProductDialogIconProps): React.ReactElement {
    const [failed, setFailed] = useState(false);
    const src = photo ?? image;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the fallback when a new image is given
    useEffect(() => setFailed(false), [src]);

    const showImage = !!src && !failed;

    return (
        <DialogIcon aria-label={ariaLabel}>
            {showImage ? <img src={src} alt="" onError={() => setFailed(true)} /> : <ProductsNavIcon />}
        </DialogIcon>
    );
}
