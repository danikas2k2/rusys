import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import ImportIcon from '@assets/import.svg';

import React, { useActionState, useCallback, useState, type SyntheticEvent } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { FileInput } from '@ui/FileInput';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';

import { useImportHandler } from '~/client/common/hooks/useImportHandler';
import { Label } from '~/client/common/Label';
import { type WithOnClose } from '~/client/common/WithOnClose';
import { useLabel } from '~/client/hooks/useLabel';
import cx from './ImportBox.pcss';

interface ImportBoxProps extends WithOnClose {
    onClose: () => void;
}

const PLACEHOLDER = 'Please choose a file';

interface ImportFooterProps {
    onCancel?: () => void;
    onSubmit?: () => void;
}

function ImportFooter({ onCancel, onSubmit }: ImportFooterProps) {
    const { pending } = useFormStatus();
    return (
        <footer>
            <Button variant="outlined" startDecorator={<CancelIcon />} onClick={onCancel}>
                <Label>Cancel</Label>
            </Button>
            <Button
                type="submit"
                variant="solid"
                color="blue"
                startDecorator={<ImportIcon />}
                disabled={pending}
                onClick={onSubmit}
            >
                <Label>Import</Label>
            </Button>
        </footer>
    );
}

export function ImportBox({ onClose }: ImportBoxProps) {
    const [error, setError] = useState<string>();

    const handleImport = useImportHandler();
    const [, formAction] = useActionState<{ import?: File }, FormData>(async (state, data) => {
        const response = await handleImport(data);
        if (response.ok) {
            onClose();
        } else {
            setError(response.error ?? 'Failed to import file');
        }
        return state;
    }, {});

    const fileRef = useAutoFocus<HTMLInputElement>();

    const handleClose = useCallback(
        (e: SyntheticEvent): void => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        },
        [onClose]
    );

    const closeLabel = useLabel('Close');
    const errorLabel = useLabel(error ?? '');

    return (
        <Dialog className={cx('ImportBox')} open onClose={onClose}>
            <form action={formAction}>
                <header>
                    <div className={cx('title')}>
                        <Label>Import</Label>
                    </div>
                    <div className={cx('close')}>
                        <IconButton aria-label={closeLabel} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </header>
                <main>
                    <FileInput
                        ref={fileRef}
                        name="import"
                        accept="application/json"
                        fullWidth
                        color={error ? 'red' : 'blue'}
                        invalid={!!error}
                        error={error ? errorLabel : undefined}
                        size="large"
                        placeholder={useLabel(PLACEHOLDER)}
                    />
                </main>
                <ImportFooter onCancel={onClose} />
            </form>
        </Dialog>
    );
}
