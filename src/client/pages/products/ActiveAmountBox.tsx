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

    // Grid tiles are tap-to-open only (no swipe), so Edit/Delete need a way in from here -
    // looked up fresh rather than carried on ProductAmounts, since that type only has the
    // group/name/image an amounts edit needs, not the parent an identity edit also needs.
    const activeProduct = useMemo(
        () =>
            activeData ? products.find((p) => p.group === activeData.group && p.name === activeData.name) : undefined,
        [activeData, products]
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

    // A rename or move changes the product's identity - point this card at the new one instead
    // of leaving it referencing a group/name that no longer exists.
    const handleEditClose = useCallback(
        (newGroup?: string, newName?: string) => {
            setEditing(false);
            if (newGroup && newName && activeData && (newGroup !== activeData.group || newName !== activeData.name)) {
                setActive({ data: { ...activeData, group: newGroup, name: newName } });
            }
        },
        [activeData, setActive]
    );

    // Delete opens right on top of this card too, same as Edit - the amounts card stays open
    // underneath while the confirmation shows, rather than going through Page's shared
    // ActiveRemoveConfirmation (which would close this card first, the same problem Edit had).
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
        handleClose();
    }, [activeData, deleteProduct, handleClose]);

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!activeData;

    return (
        <>
            <AmountBox
                opened={opened}
                photo={activeData?.photo}
                closeOnEscape={!editing && !removing}
                closeOnClickOutside={!editing && !removing}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                onEdit={handleEdit}
                onDelete={handleDelete}
                title={<AmountTitle {...activeData} />}
            />
            <ProductBox
                opened={editing}
                group={activeData?.group}
                name={activeData?.name}
                parent={activeProduct?.parent}
                image={activeData?.image}
                onClose={handleEditClose}
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
