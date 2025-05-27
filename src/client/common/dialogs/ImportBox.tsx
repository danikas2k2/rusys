import React, { useActionState, useCallback, useState, type SyntheticEvent } from 'react';
import { useFormStatus } from 'react-dom';
import CancelIcon from '@assets/cancel.svg';
import CloseIcon from '@assets/close.svg';
import ImportIcon from '@assets/import.svg';
import { Button, IconButton } from '@ui/Button';
import { Dialog } from '@ui/Dialog';
import { FileInput } from '@ui/FileInput';
import { useAutoFocus } from '@ui/hooks/useAutoFocus';
import { Input } from '@ui/Input';
import { useImportHandler } from '~/client/common/hooks/useImportHandler';
import { Label } from '~/client/common/Label';
import { type WithOnClose } from '~/client/common/WithOnClose';
import { useLabel } from '~/client/hooks/useLabel';
// import { getErrorMessage } from '~/common/utils/errors';
import cx from './ImportBox.less';

interface ImportBoxProps extends WithOnClose {
    onClose: () => void;
}

const PLACEHOLDER = 'Please choose a file';
// const ERROR_GROUP_MISSING = 'Group is required';
// const ERROR_FILE_MISSING = 'File is required';

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
                color="primary"
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
    // const [updating, setUpdating] = useState(false);
    // const [file, setFile] = useState<string>();
    const [errors /*, setErrors*/] = useState<Record<string, string>>();

    const handleImport = useImportHandler();
    const [, formAction] = useActionState<{ import?: File }, FormData>(async (state, data) => {
        // console.info('ImportBox: formAction', state, JSON.stringify(Object.fromEntries(data)));
        await handleImport(data);
        return state;
    }, {});

    // console.info('ImportBox: formAction', state, (data.get('import') as File).name);
    // useEffect(() => {
    //     setErrors(undefined);
    // }, [file]);

    const fileRef = useAutoFocus<HTMLInputElement>();

    // console.info({
    //     state,
    // });

    /*const handleSubmit = useCallback(async (): Promise<void> => {
        const newErrors: Record<string, string> = {};
        if (!file) {
            newErrors.variant = ERROR_FILE_MISSING;
        }
        if (!isEmpty(newErrors)) {
            setErrors(newErrors);
            fileRef?.focus();
            return;
        }
        try {
            setUpdating(true);
            await handleImport(file);
            onClose();
        } catch (e) {
            setErrors({ _: getErrorMessage(e) });
            fileRef?.focus();
        } finally {
            setUpdating(false);
        }
    }, [fileRef, file, handleImport, onClose]);*/

    const handleClose = useCallback(
        (e: SyntheticEvent): void => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        },
        [onClose]
    );

    // const handleFileInput = useCallback((e: FormEvent<HTMLInputElement>) => setFile(e.currentTarget.value), []);

    // const handleEnter = useCallback(
    //     (e: KeyboardEvent<HTMLInputElement>) => {
    //         if (e.key === 'Enter') {
    //             void handleSubmit();
    //         }
    //     },
    //     [handleSubmit]
    // );

    const closeLabel = useLabel('Close');
    const errorLabel = useLabel(errors?._ ?? '');

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
                        color={errors?._ || errors?.variant ? 'negative' : 'primary'}
                        invalid={!!errors?._ || !!errors?.variant}
                        error={errors?._ ? errorLabel : undefined}
                        size="large"
                        placeholder={useLabel(PLACEHOLDER)}
                        // onInput={handleFileInput}
                        // onKeyDown={handleEnter}
                        // required
                    />
                </main>
                <ImportFooter onCancel={onClose} />
            </form>
        </Dialog>
    );
}
