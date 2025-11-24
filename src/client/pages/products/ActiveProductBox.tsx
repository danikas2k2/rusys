import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { ProductBox } from '~/client/pages/products/ProductBox';
import type { Product } from '~/types/data';

export function ActiveProductBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<Product>();

    const opened = active?.action === 'update';

    const handleClose = useCallback(() => setActive({ data: active?.data }), [active?.data, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    return <ProductBox opened={opened} {...active?.data} onClose={handleClose} onAfterClose={handleAfterClose} />;
}
