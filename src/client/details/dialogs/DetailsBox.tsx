import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DeleteIcon from '@icons/Delete.svg';
import DoneIcon from '@icons/Done.svg';
import { Button } from '@ui/Button';
import { ButtonWithConfirmation } from '~/client/common/ButtonWithConfirmation';
import { Dialog } from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { IconButton } from '@ui/IconButton';
import { Input } from '@ui/Input';
import { LabeledInput } from '@ui/LabeledInput';
import React, { type FormEvent, type KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { WithOnClose } from '~/client/common/WithOnClose';
import { useLabel } from '~/client/hooks/useLabel';
import { useNameMatch } from '~/client/hooks/useNameMatch';
import { Label } from '~/client/common/Label';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useDeleteDetails } from '~/state/details/useDeleteDetails';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { getErrorMessage } from '~/utils/errors';
import cx from './DetailsBox.less';

interface DetailsBoxProps extends WithOnClose {
    group?: string;
    name?: string;
    onClose: (group?: string, name?: string) => void;
}

const PLACEHOLDER = 'Please enter a name';
const ALREADY_EXISTS = 'This name already exists';

export function DetailsBox({ group = '', name: initialName = '', onClose }: DetailsBoxProps) {
    const [name, setName] = useState<string>(initialName);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        setError(undefined);
    }, [name]);

    const hasName = useNameMatch(group, name) && name !== initialName && !updating;
    useEffect(() => {
        if (hasName && !error) {
            setError(ALREADY_EXISTS);
        }
    }, [hasName, error]);

    const focusRef = useAutoFocus<HTMLInputElement>();

    const addDetails = useAddDetails();
    const renameDetails = useRenameDetails();
    const handleUpdate = useCallback(async (): Promise<void> => {
        if (!name) {
            setError(PLACEHOLDER);
            focusRef?.focus();
        } else if (hasName) {
            focusRef?.focus();
        } else {
            try {
                setUpdating(true);
                if (initialName) {
                    if (name !== initialName) {
                        await renameDetails(group, initialName, name);
                    }
                } else {
                    await addDetails(group, name);
                }
                onClose(group, name);
            } catch (error) {
                setError(getErrorMessage(error));
                focusRef?.focus();
            } finally {
                setUpdating(false);
            }
        }
    }, [addDetails, focusRef, group, hasName, initialName, name, onClose, renameDetails]);

    const removeDetails = useDeleteDetails();
    const handleRemove = useCallback(async (): Promise<void> => {
        try {
            setUpdating(true);
            await removeDetails(group, initialName);
            onClose(group, initialName);
        } catch (error) {
            setError(getErrorMessage(error));
            focusRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [focusRef, group, initialName, onClose, removeDetails]);

    const handleClose = useCallback((): void => {
        onClose();
    }, [onClose]);

    const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => setName(e.currentTarget.value), []);

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
    const titleLabel = useLabel('Title');
    return (
        <Dialog className={cx('DetailsBox')} open onClose={handleClose}>
            <header>
                <div className={cx('group')}>
                    <Label>{group}</Label>
                </div>
                <div className={cx('title')}>
                    <Label>{initialName ? 'Update entry' : 'Add new entry'}</Label>
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
                    error={error && error !== PLACEHOLDER ? errorLabel : undefined}
                    size="large"
                    value={name}
                    label={titleLabel}
                    placeholder={useLabel(PLACEHOLDER)}
                    onInput={handleInput}
                    onKeyDown={handleEnter}
                />
            </main>
            <footer>
                {initialName && (
                    <>
                        <ButtonWithConfirmation
                            variant="outlined"
                            color="negative"
                            startDecorator={<DeleteIcon />}
                            dialogHeader={<Label>Sure to remove?</Label>}
                            onClick={handleRemove}
                        >
                            <Label>Remove</Label>
                        </ButtonWithConfirmation>
                        <div className={cx('spacer')} />
                    </>
                )}
                <Button variant="outlined" onClick={handleClose} startDecorator={<CancelIcon />}>
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="primary" onClick={handleUpdate} startDecorator={<DoneIcon />}>
                    <Label>{initialName ? 'Update' : 'Add'}</Label>
                </Button>
            </footer>
        </Dialog>
    );
}
