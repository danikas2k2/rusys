import React, { useCallback, useRef } from 'react';

import type { Product, ProductAmounts } from '~/common/data';
import { useActiveContent, useSetActiveContent } from '~/components/runtime/ActiveContentContext';
import { ProductBox } from '~/features/products/ProductBox';

export function ActiveProductBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<Product>();
    const setAmountsActive = useSetActiveContent<ProductAmounts>();

    const opened = active?.action === 'update';

    // handleAfterClose fires once the modal's own exit transition finishes, which is after
    // the amounts dialog (triggered below) has already taken over the shared active store -
    // this flag stops it from clobbering that with an unconditional clear.
    const amountsRequestedRef = useRef(false);

    const handleClose = useCallback(
        (group?: string, name?: string) => {
            // active.data is only set when editing an existing product - a bare 'update' action
            // with no data means this was the "add new" flow, so jump straight into its amounts.
            if (!active?.data && group && name) {
                amountsRequestedRef.current = true;
                setAmountsActive({
                    action: 'values',
                    data: { group, name, year: new Date().getFullYear() % 100, amounts: [] },
                });
                return;
            }
            amountsRequestedRef.current = false;
            setActive({ data: active?.data });
        },
        [active?.data, setActive, setAmountsActive]
    );

    const handleAfterClose = useCallback(() => {
        if (amountsRequestedRef.current) {
            amountsRequestedRef.current = false;
            return;
        }
        setActive();
    }, [setActive]);

    return <ProductBox opened={opened} {...active?.data} onClose={handleClose} onAfterClose={handleAfterClose} />;
}
