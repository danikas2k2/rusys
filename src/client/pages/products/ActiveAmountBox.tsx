import React, { useCallback, useMemo } from 'react';

import { useActiveContent, useSetActiveContent } from '~/client/common/ActiveContentContext';
import { AmountTitle } from '~/client/common/AmountTitle';
import { AmountBox } from '~/client/pages/products/AmountBox';
import { useProducts } from '~/client/state/products/useProducts';
import type { Product, ProductAmounts } from '~/types/data';

export function ActiveAmountBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();
    const setProductActive = useSetActiveContent<Product>();
    const products = useProducts();

    const activeData = active?.data;

    // Grid tiles are tap-to-open only (no swipe), so Edit/Delete need a way in from here -
    // looked up fresh rather than carried on ProductAmounts, since that type only has the
    // group/name/image an amounts edit needs, not the parent an identity edit also needs.
    const activeProduct = useMemo(
        () =>
            activeData ? products.find((p) => p.group === activeData.group && p.name === activeData.name) : undefined,
        [activeData, products]
    );

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);
    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const handleEdit = useCallback(() => {
        if (!activeData) {
            return;
        }
        setProductActive({
            action: 'update',
            data: {
                group: activeData.group,
                name: activeData.name,
                parent: activeProduct?.parent,
                image: activeData.image,
            },
        });
    }, [activeData, activeProduct, setProductActive]);

    const handleDelete = useCallback(() => {
        if (!activeData) {
            return;
        }
        setProductActive({ action: 'remove', data: { group: activeData.group, name: activeData.name } });
    }, [activeData, setProductActive]);

    const opened = active?.action === 'values' && !!activeData;

    return (
        <AmountBox
            opened={opened}
            image={activeData?.image}
            onClose={handleClose}
            onAfterClose={handleAfterClose}
            onEdit={handleEdit}
            onDelete={handleDelete}
            title={<AmountTitle {...activeData} />}
        />
    );
}
