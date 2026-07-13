import React, { useCallback, useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { AmountBox } from '~/client/pages/common/AmountBox';
import { AmountTitle } from '~/client/pages/products/AmountTitle';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { useProducts } from '~/client/state/products/useProducts';
import { useRedoProduct } from '~/client/state/products/useRedoProduct';
import { useUndoProduct } from '~/client/state/products/useUndoProduct';
import { useUpdateProduct } from '~/client/state/products/useUpdateProduct';
import { useProfile } from '~/client/state/profile/useProfile';
import type { ProductAmounts, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();
    const [, setUpdating] = useUpdatingProducts();

    const profile = useProfile();
    const updateProduct = useUpdateProduct();
    const undoProduct = useUndoProduct();
    const redoProduct = useRedoProduct();

    const products = useProducts();

    const activeData = active?.data;

    const activeProduct = useMemo(
        () =>
            activeData ? products.find((p) => p.group === activeData.group && p.name === activeData.name) : undefined,
        [activeData, products]
    );

    const currentAmounts = useMemo(() => {
        if (!activeData || !activeProduct) {
            return activeData?.amounts;
        }
        return activeProduct.years?.find((y) => y.year === activeData.year)?.amounts ?? [];
    }, [activeData, activeProduct]);

    const year = active?.data?.year ?? 0;
    const canUndo = !!activeProduct?.updates?.some((u) => 'year' in u && u.year === year);
    const canRedo = !!activeProduct?.undates?.some((u) => 'year' in u && u.year === year);

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const handleSubmit = useCallback(
        async (changed: readonly VariantAmount[]): Promise<void> => {
            const clean = changed.filter(({ amount }) => !!amount) ?? [];
            if (activeData && clean.length) {
                setUpdating(activeData, true);
                void updateProduct(activeData.group, activeData.name, activeData.year, clean, profile.email).finally(
                    () => setUpdating(activeData, false)
                );
            }
            handleClose();
        },
        [activeData, handleClose, setUpdating, updateProduct, profile.email]
    );

    const handleUndo = useCallback(async (): Promise<void> => {
        if (activeData) {
            setUpdating(activeData, true);
            await undoProduct(activeData.group, activeData.name, activeData.year).finally(() =>
                setUpdating(activeData, false)
            );
        }
    }, [activeData, setUpdating, undoProduct]);

    const handleRedo = useCallback(async (): Promise<void> => {
        if (activeData) {
            setUpdating(activeData, true);
            await redoProduct(activeData.group, activeData.name, activeData.year).finally(() =>
                setUpdating(activeData, false)
            );
        }
    }, [activeData, setUpdating, redoProduct]);

    const opened = active?.action === 'values' && !!activeData;

    return (
        <UpdateTypeWrapper>
            <AmountBox
                opened={opened}
                group={activeData?.group ?? ''}
                amounts={currentAmounts}
                onSubmit={handleSubmit}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                title={<AmountTitle {...activeData} />}
            />
        </UpdateTypeWrapper>
    );
}
