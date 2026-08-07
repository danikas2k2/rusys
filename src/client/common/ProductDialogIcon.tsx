import React, { useEffect, useState } from 'react';

import { ProductsNavIcon } from '@icons';

import { DialogIcon } from '~/client/common/DialogIcon';
import type { ImageRef } from '~/types/data';

export interface ProductDialogIconProps {
    // A plain string covers a form's in-progress image (a data: URL not yet classified, or an
    // existing url kept as-is) - an ImageRef is the already-classified, stored shape.
    image?: ImageRef | string;
    'aria-label'?: string;
}

// Same oversized, blurred watermark DialogIcon has always shown - just the product's own photo
// instead of the generic icon, once it has one. Deliberately not distinguishing icon vs photo
// mode here (unlike the grid tile): the watermark crops and blurs everything the same way
// regardless of the source image's own aspect ratio, so there's nothing to tell apart. Prefers
// the bigger photoUrl over the icon-sized url when both exist.
export function ProductDialogIcon({ image, 'aria-label': ariaLabel }: ProductDialogIconProps): React.ReactElement {
    const [failed, setFailed] = useState(false);
    const src = typeof image === 'string' ? image : (image?.photoUrl ?? image?.url);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the fallback when a new image is given
    useEffect(() => setFailed(false), [src]);

    const showImage = !!src && !failed;

    return (
        <DialogIcon aria-label={ariaLabel}>
            {showImage ? <img src={src} alt="" onError={() => setFailed(true)} /> : <ProductsNavIcon />}
        </DialogIcon>
    );
}
