import React, { useCallback } from 'react';

import { useActiveContent, useSetActiveContent } from '~/client/common/ActiveContentContext';
import { ProductBox } from '~/client/pages/products/ProductBox';
import type { Product, ProductAmounts } from '~/types/data';

export function ActiveProductBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<Product>();
    const setAmountsActive = useSetActiveContent<ProductAmounts>();

    const opened = active?.action === 'update';

    const handleClose = useCallback(
        (group?: string, name?: string) => {
            // active.data is only set when editing an existing product - a bare 'update' action
            // with no data means this was the "add new" flow, so jump straight into its amounts.
            if (!active?.data && group && name) {
                setAmountsActive({
                    action: 'values',
                    data: { group, name, year: new Date().getFullYear() % 100, amounts: [] },
                });
                return;
            }
            setActive({ data: active?.data });
        },
        [active?.data, setActive, setAmountsActive]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    return <ProductBox opened={opened} {...active?.data} onClose={handleClose} onAfterClose={handleAfterClose} />;
}
