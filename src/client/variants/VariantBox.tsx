import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DeleteIcon from '@icons/Delete.svg';
import DoneIcon from '@icons/Done.svg';
import { Button } from '@ui/Button';
import { ButtonWithConfirmation } from '@ui/ButtonWithConfirmation';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { IconButton } from '@ui/IconButton';
import { LabeledInput } from '@ui/LabeledInput';
import React, { type FormEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { Label } from '~/client/Label';
import { compareNames } from '~/client/utils/compareNames';
import { useAddVariant } from '~/state/variants/useAddVariant';
import { useDeleteVariant } from '~/state/variants/useDeleteVariant';
import { useRenameVariant } from '~/state/variants/useRenameVariant';
import { useVariants } from '~/state/variants/useVariants';
import { getErrorMessage } from '~/utils/errors';
import cx from './VariantBox.less';

interface VariantBoxProps {
    group?: string;
    variant?: string;
    onClose: (group?: string, variant?: string) => void;
}

const ERROR_MISSING = 'Name is required';
const ERROR_EXISTS = 'Variant already exists';

export function VariantBox({ group: initialGroup = '', variant: initialVariant = '', onClose }: VariantBoxProps) {
    const [updating, setUpdating] = useState(false);
    const [group, setGroup] = useState<string>(initialGroup);
    const [variant, setVariant] = useState<string>(initialVariant);
    const [error, setError] = useState<string>();
    console.info(error);

    useEffect(() => {
        setError(undefined);
    }, [variant]);

    const hasSameVariant = useVariants()?.some((v) => !compareNames(v.variant, variant));
    const variantRenamed = variant !== initialVariant;
    const hasVariant = hasSameVariant && variantRenamed && !updating;
    console.info(hasVariant, { hasSameVariant, variantRenamed, updating });
    useEffect(() => {
        if (hasVariant && !error) {
            setError(ERROR_EXISTS);
        }
    }, [hasVariant, error]);

    const focusRef = useAutoFocus<HTMLInputElement>();

    const addVariant = useAddVariant();
    const renameVariant = useRenameVariant();
    const handleUpdate = useCallback(async (): Promise<void> => {
        if (!variant) {
            setError(ERROR_MISSING);
            focusRef?.focus();
            return;
        }
        if (hasVariant) {
            focusRef?.focus();
            return;
        }
        try {
            setUpdating(true);
            if (initialVariant) {
                if (variantRenamed) {
                    await renameVariant(group, initialVariant, variant);
                }
            } else {
                await addVariant(group, variant);
            }
            onClose(group, variant);
        } catch (error) {
            setError(getErrorMessage(error));
            focusRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [variant, hasVariant, focusRef, initialVariant, onClose, group, variantRenamed, renameVariant, addVariant]);

    const deleteVariant = useDeleteVariant();
    const handleDelete = useCallback(async (): Promise<void> => {
        try {
            setUpdating(true);
            await deleteVariant(initialGroup, initialVariant);
            onClose(group, initialVariant);
        } catch (error) {
            setError(getErrorMessage(error));
            focusRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [deleteVariant, initialGroup, initialVariant, onClose, group, focusRef]);

    const handleClose = useCallback((): void => {
        onClose();
    }, [onClose]);

    const handleGroupInput = useCallback((e: FormEvent<HTMLInputElement>) => setVariant(e.currentTarget.value), []);

    const handleEnter = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                void handleUpdate();
            }
        },
        [handleUpdate]
    );

    const closeLabel = useLabel('Close');
    const errorLabel = useLabel(error ?? '');
    console.info({ errorLabel });
    const inputLabel = useLabel('Variant name');
    return (
        <Dialog className={cx('VariantBox')} open onClose={handleClose}>
            <header>
                <div className={cx('title')}>
                    <Label>{initialVariant ? 'Update group' : 'Add new group'}</Label>
                </div>
                <div className={cx('close')}>
                    <IconButton aria-label={closeLabel} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <main>
                <LabeledInput
                    ref={focusRef}
                    fullWidth
                    color={error ? 'negative' : 'primary'}
                    error={error && error !== ERROR_MISSING ? errorLabel : undefined}
                    size="large"
                    value={variant}
                    label={inputLabel}
                    onInput={handleGroupInput}
                    onKeyDown={handleEnter}
                />
            </main>
            <footer>
                {initialVariant && (
                    <>
                        <ButtonWithConfirmation
                            variant="outlined"
                            color="negative"
                            onClick={handleDelete}
                            header={<Label>Sure to remove?</Label>}
                            cancel={
                                <>
                                    <CancelIcon />
                                    <Label>Cancel</Label>
                                </>
                            }
                            confirm={
                                <>
                                    <DeleteIcon />
                                    <Label>Remove</Label>
                                </>
                            }
                            confirmColor="negative"
                        >
                            <DeleteIcon />
                            <Label>Remove</Label>
                        </ButtonWithConfirmation>
                        <div className={cx('spacer')} />
                    </>
                )}
                <Button variant="outlined" onClick={handleClose}>
                    <CancelIcon />
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="primary" onClick={handleUpdate}>
                    <DoneIcon />
                    <Label>{initialVariant ? 'Update' : 'Add'}</Label>
                </Button>
            </footer>
        </Dialog>
    );
}
