import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { ValueBox } from '~/client/pages/products/ValueBox';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';
import { useProfile } from '~/client/state/profile/useProfile';
import type { ProductAmounts, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();
    const [, setUpdating] = useUpdatingProducts();

    const profile = useProfile();
    const updateProduct = useUpdateProduct();

    const handleClose = useCallback(
        async (changed?: readonly VariantAmount[]): Promise<void> => {
            const data = active?.data;
            const clean = changed?.filter(({ amount }) => !!amount) ?? [];
            if (data && clean.length) {
                setUpdating(data, true);
                void updateProduct(data.group, data.name, data.year, clean, profile.email).finally(() =>
                    setUpdating(data, false)
                );
            }
            setActive({ data });
        },
        [active?.data, setActive, setUpdating, updateProduct, profile.email]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!active?.data;

    return (
        <UpdateTypeWrapper>
            <ValueBox
                opened={opened}
                {...(active?.data ?? { group: '', name: '', year: 0 })}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
            />
        </UpdateTypeWrapper>
    );
}
