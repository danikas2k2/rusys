import CancelIcon from '@icons/Cancel.svg';
import CloseIcon from '@icons/Close.svg';
import DeleteIcon from '@icons/Delete.svg';
import DoneIcon from '@icons/Done.svg';
import Button from '@ui/Button';
import ButtonWithConfirmation from '@ui/ButtonWithConfirmation';
import Dialog from '@ui/Dialog';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import IconButton from '@ui/IconButton';
import Input from '@ui/Input';
import { isEqual } from 'lodash';
import React, { type FormEvent, type KeyboardEvent, memo, useCallback, useEffect, useState } from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { useNameMatch } from '~/client/hooks/useNameMatch';
import Label from '~/client/Label';
import { useAddDetails } from '~/state/details/useAddDetails';
import { useRemoveDetails } from '~/state/details/useRemoveDetails';
import { useRenameDetails } from '~/state/details/useRenameDetails';
import { type Group, type Name } from '~/state/types';
import { getErrorMessage } from '~/utils/errors';
import './EditBox.less';

interface EditBoxProps {
    group?: Group;
    name?: Name;
    onClose: (group?: Group, name?: Name) => void;
}

const PLACEHOLDER = 'Please enter a name';
const ALREADY_EXISTS = 'This name already exists';

export default memo(function EditBox({ group = '', name: initialName = '', onClose }: EditBoxProps) {
    const [name, setName] = useState<Name>(initialName);
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

    const removeDetails = useRemoveDetails();
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

    return (
        <Dialog className="EditBox" open onClose={handleClose}>
            <header>
                <div className="group">
                    <Label>{group}</Label>
                </div>
                <div className="title">
                    <Label>{initialName ? 'Update entry' : 'Add new entry'}</Label>
                </div>
                <div className="close">
                    <IconButton aria-label={useLabel('Close')} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </header>
            <main>
                <Input
                    ref={focusRef}
                    fullWidth
                    color={error ? 'negative' : 'primary'}
                    size="large"
                    value={name}
                    placeholder={useLabel(PLACEHOLDER)}
                    onInput={handleInput}
                    onKeyDown={handleEnter}
                />
                {error && error !== PLACEHOLDER && (
                    <div role="alert" className="error">
                        <Label>{error}</Label>
                    </div>
                )}
            </main>
            <footer>
                {initialName && (
                    <>
                        <ButtonWithConfirmation
                            variant="outlined"
                            color="negative"
                            onClick={handleRemove}
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
                        <div className="spacer" />
                    </>
                )}
                <Button variant="outlined" onClick={handleClose}>
                    <CancelIcon />
                    <Label>Cancel</Label>
                </Button>
                <Button variant="solid" color="primary" onClick={handleUpdate}>
                    <DoneIcon />
                    <Label>{initialName ? 'Update' : 'Add'}</Label>
                </Button>
            </footer>
        </Dialog>
    );
}, isEqual);
