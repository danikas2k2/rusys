import { Button } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { ConfirmationDialogIcon, DeleteIcon } from '@icons';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountTitle } from '~/client/common/AmountTitle';
import { ConfirmationDialog } from '~/client/common/ConfirmationDialog';
import { DialogIcon } from '~/client/common/DialogIcon';
import { Label } from '~/client/common/Label';
import { AmountBox } from '~/client/pages/products/AmountBox';
import { ProductBox } from '~/client/pages/products/ProductBox';
import { useDeleteProduct } from '~/client/state/products/useDeleteProduct';
import { useProducts } from '~/client/state/products/useProducts';
import type { ProductAmounts } from '~/types/data';

export function ActiveAmountBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();
    const deleteProduct = useDeleteProduct();
    const products = useProducts();

    const activeData = active?.data;

    // Grid tiles are tap-to-open only (no swipe), so product editing is entered from the amount
    // dialog. Look the product up fresh because ProductAmounts does not carry its parent.
    const activeProduct = useMemo(
        () =>
            activeData ? products.find((p) => p.group === activeData.group && p.name === activeData.name) : undefined,
        [activeData, products]
    );

    // Product identity/image data in active content is only the snapshot captured when the
    // amounts dialog was opened. Keep the year/amount context from that snapshot, but render
    // mutable product metadata from Redux so an edit underneath this dialog is reflected as
    // soon as its API response updates the products list.
    const currentData = useMemo(
        () =>
            activeData && activeProduct
                ? {
                      ...activeData,
                      group: activeProduct.group,
                      name: activeProduct.name,
                      image: activeProduct.image,
                      photo: activeProduct.photo,
                  }
                : activeData,
        [activeData, activeProduct]
    );

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);

    // Edit opens right on top of this card (see the second ProductBox instance below), rather
    // than handing the shared active store off to it the way ActiveProductBox normally would -
    // this card never actually closes, so there's nothing to reopen once editing is done.
    const [editing, setEditing] = useState(false);
    const handleEdit = useCallback(() => {
        if (!activeData) {
            return;
        }
        setEditing(true);
    }, [activeData]);

    // A successful save may change both identity and visual metadata. Keep this amounts dialog
    // active while pointing it at the saved identity; currentData above will then pick up the
    // freshly returned image/photo from Redux as well.
    const handleEditClose = useCallback(
        (newGroup?: string, newName?: string) => {
            setEditing(false);
            if (newGroup && newName && activeData) {
                setActive({ action: 'values', data: { ...activeData, group: newGroup, name: newName } });
            }
        },
        [activeData, setActive]
    );

    // Delete is initiated by ProductBox's footer, matching category and variant dialogs. The
    // confirmation still stacks above both dialogs so cancelling returns to the edit form.
    const [removing, setRemoving] = useState(false);
    const handleDelete = useCallback(() => {
        if (!activeData) {
            return;
        }
        setRemoving(true);
    }, [activeData]);
    const handleRemoveClose = useCallback(() => setRemoving(false), []);
    const handleRemoveConfirm = useCallback(async () => {
        if (!activeData) {
            return;
        }
        await deleteProduct(activeData.group, activeData.name);
        setRemoving(false);
        setEditing(false);
        handleClose();
    }, [activeData, deleteProduct, handleClose]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!activeData;

    return (
        <>
            <AmountBox
                opened={opened}
                photo={currentData?.photo}
                closeOnEscape={!editing && !removing}
                closeOnClickOutside={!editing && !removing}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                onEdit={handleEdit}
                title={<AmountTitle {...currentData} />}
            />
            <ProductBox
                opened={editing}
                group={activeData?.group}
                name={activeData?.name}
                parent={activeProduct?.parent}
                image={currentData?.image}
                expiryToleranceDays={activeProduct?.expiryToleranceDays}
                onClose={handleEditClose}
                onDelete={handleDelete}
                closeOnEscape={!removing}
                closeOnClickOutside={!removing}
            />
            <ConfirmationDialog
                opened={removing}
                onClose={handleRemoveClose}
                onConfirm={handleRemoveConfirm}
                title={
                    <>
                        <DialogIcon>
                            <ConfirmationDialogIcon />
                        </DialogIcon>
                        <Label>Are you sure to remove?</Label>
                    </>
                }
                confirmButton={
                    <Button variant="filled" color="negative" leftSection={<DeleteIcon size={18} />}>
                        <Label>Remove</Label>
                    </Button>
                }
            />
        </>
    );
}
