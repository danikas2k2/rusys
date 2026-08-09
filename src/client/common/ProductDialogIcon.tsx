import React, { useEffect, useState } from 'react';

import { ProductsNavIcon } from '@icons';

import { DialogIcon } from '~/client/common/DialogIcon';

export interface ProductDialogIconProps {
    // Only ever the product's own larger photo, never its icon-sized image derivative - when
    // there's no photo (or none passed at all, e.g. the identity-edit dialog), this falls back to
    // the generic products icon rather than blowing up a small icon into a blurred watermark.
    photo?: string;
    'aria-label'?: string;
}

// Same oversized, blurred watermark DialogIcon has always shown - just the product's own photo
// instead of the generic icon, once it has one.
export function ProductDialogIcon({ photo, 'aria-label': ariaLabel }: ProductDialogIconProps): React.ReactElement {
    const [failed, setFailed] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the fallback when a new photo is given
    useEffect(() => setFailed(false), [photo]);

    const showPhoto = !!photo && !failed;

    return (
        <DialogIcon aria-label={ariaLabel}>
            {showPhoto ? <img src={photo} alt="" onError={() => setFailed(true)} /> : <ProductsNavIcon />}
        </DialogIcon>
    );
}
