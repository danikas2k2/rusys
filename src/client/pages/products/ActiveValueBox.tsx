import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { AmountBox } from '~/client/pages/common/AmountBox';
import { AmountTitle } from '~/client/pages/products/AmountTitle';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';
import { useProfile } from '~/client/state/profile/useProfile';
import type { ProductAmounts, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();
    const [, setUpdating] = useUpdatingProducts();

    const profile = useProfile();
    const updateProduct = useUpdateProduct();

    const handleClose = useCallback(() => setActive({ data: active?.data }), [active?.data, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const handleSubmit = useCallback(
        async (changed: readonly VariantAmount[]): Promise<void> => {
            const data = active?.data;
            const clean = changed.filter(({ amount }) => !!amount) ?? [];
            if (data && clean.length) {
                setUpdating(data, true);
                void updateProduct(data.group, data.name, data.year, clean, profile.email).finally(() =>
                    setUpdating(data, false)
                );
            }
            handleClose();
        },
        [active?.data, handleClose, setUpdating, updateProduct, profile.email]
    );

    const opened = active?.action === 'values' && !!active?.data;

    return (
        <UpdateTypeWrapper>
            <AmountBox
                opened={opened}
                group={active?.data?.group ?? ''}
                amounts={active?.data?.amounts}
                onSubmit={handleSubmit}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                title={<AmountTitle {...active?.data} />}
            />
        </UpdateTypeWrapper>
    );
}
