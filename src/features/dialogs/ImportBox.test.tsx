import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockPage } from '@tests/MockPage';

import React from 'react';

import { ImportBox } from '~/features/dialogs/ImportBox';
import { useImportHandler } from '~/lib/hooks/useImportHandler';

vi.mock(import('~/components/common/Label'));
vi.mock(import('~/lib/hooks/useLabel'), (): any => ({
    useLabel: vi.fn((key: string) => key),
}));
vi.mock(import('~/lib/hooks/useImportHandler'));
vi.mock(import('@mantine/dropzone'), (): any => {
    const DropzoneComponent = ({
        onDrop,
        onReject,
        children,
    }: {
        onDrop: (files: File[]) => void;
        onReject?: () => void;
        children: React.ReactNode;
    }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                onDrop(Array.from(e.target.files));
            }
        };
        const handleReject = () => {
            onReject?.();
        };
        return (
            <div>
                <input type="file" placeholder="Please choose a file" onChange={handleChange} />
                <button type="button" onClick={handleReject} aria-label="Reject file">
                    Reject
                </button>
                {children}
            </div>
        );
    };

    DropzoneComponent.Accept = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    DropzoneComponent.Reject = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    DropzoneComponent.Idle = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

    return { Dropzone: DropzoneComponent };
});

describe('<ImportBox>', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = vi.fn();

    beforeEach(() => {
        vi.mocked(useImportHandler).mockReturnValue(vi.fn().mockResolvedValue({ ok: true }));
    });

    afterEach(() => vi.clearAllMocks());

    it('renders with cancel button', () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        expect(screen.getByPlaceholderText('Please choose a file')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
    });

    it('uses default opened value when not provided', () => {
        render(
            <MockPage state={state}>
                <ImportBox onClose={onClose} />
            </MockPage>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('discard confirmation', () => {
        it('closes without confirmation when no file is selected', async () => {
            render(
                <MockPage state={state}>
                    <ImportBox opened onClose={onClose} />
                </MockPage>
            );

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).toHaveBeenCalledWith();
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when a file is selected', async () => {
            render(
                <MockPage state={state}>
                    <ImportBox opened onClose={onClose} />
                </MockPage>
            );

            const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
            const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });
            await user.upload(fileInput, file);

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            render(
                <MockPage state={state}>
                    <ImportBox opened onClose={onClose} />
                </MockPage>
            );

            const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
            const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });
            await user.upload(fileInput, file);

            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(screen.getByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledWith();
        });

        it('keeps the dialog open when cancelling the discard confirmation', async () => {
            render(
                <MockPage state={state}>
                    <ImportBox opened onClose={onClose} />
                </MockPage>
            );

            const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
            const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });
            await user.upload(fileInput, file);

            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByText('test.zip')).toBeInTheDocument();
        });
    });

    describe('calls import handler when importing a file', () => {
        it('closes dialog without error when successfully imported', async () => {
            const importData = vi.fn().mockResolvedValue({ ok: true });
            vi.mocked(useImportHandler).mockReturnValue(importData);

            render(
                <MockPage state={state}>
                    <ImportBox opened onClose={onClose} />
                </MockPage>
            );

            const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
            const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });

            await user.upload(fileInput, file);

            expect(fileInput.files).toHaveLength(1);
            expect(fileInput.files?.[0]).toStrictEqual(file);

            await user.click(screen.getByRole('button', { name: 'Import' }));

            expect(importData).toHaveBeenCalledWith(expect.any(FormData));
            expect(importData.mock.calls[0][0].get('import')).toStrictEqual(file);
            expect(onClose).toHaveBeenCalledWith();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('shows error when file is rejected', async () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        await user.click(screen.getByRole('button', { name: 'Reject file' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Choose a valid ZIP file');
    });

    it('disables import button when no file is selected', () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const importButton = screen.getByRole('button', { name: 'Import' });

        expect(importButton).toBeDisabled();
    });

    it('shows error when import fails', async () => {
        const importData = vi.fn().mockRejectedValue(new Error('Import failed'));
        vi.mocked(useImportHandler).mockReturnValue(importData);

        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });

        await user.upload(fileInput, file);
        await user.click(screen.getByRole('button', { name: 'Import' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Import failed');
    });

    it('shows default error message when import fails without error', async () => {
        const importData = vi.fn().mockRejectedValue({});
        vi.mocked(useImportHandler).mockReturnValue(importData);

        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });

        await user.upload(fileInput, file);
        await user.click(screen.getByRole('button', { name: 'Import' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Failed to import file');
    });

    it('handles empty files array in handleDrop', async () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });

        await user.upload(fileInput, file);

        const fileItem = screen.getByText('test.zip');

        expect(fileItem).toBeInTheDocument();

        await user.upload(fileInput, []);

        expect(fileItem).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import' })).not.toBeDisabled();
    });

    it('shows file size warning when file exceeds max size', async () => {
        const largeFile = new File(['zip-bytes'], 'large.zip', { type: 'application/zip' });
        Object.defineProperty(largeFile, 'length', {
            value: 201 * 1024 * 1024,
            writable: false,
            configurable: true,
        });

        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');

        await user.upload(fileInput, largeFile);

        expect(screen.getByText(/File should not exceed/)).toBeInTheDocument();
    });

    it('shows file size warning when no file is selected', () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        expect(screen.getByText(/File should not exceed/)).toBeInTheDocument();
    });

    it('shows file name when file is selected', async () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });

        await user.upload(fileInput, file);

        expect(screen.getByText('test.zip')).toBeInTheDocument();
        expect(screen.queryByText(/Drag ZIP file here/)).not.toBeInTheDocument();
    });

    it('does not show file size warning when file is within size limit', async () => {
        const smallFile = new File(['zip-bytes'], 'small.zip', { type: 'application/zip' });
        Object.defineProperty(smallFile, 'length', { value: 5 * 1024 * 1024, writable: false, configurable: true });

        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');

        await user.upload(fileInput, smallFile);

        expect(screen.queryByText(/File should not exceed/)).not.toBeInTheDocument();
    });

    it('clears state when dialog closes', () => {
        const { rerender } = render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        rerender(
            <MockPage state={state}>
                <ImportBox opened={false} onClose={onClose} />
            </MockPage>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not clear state when dialog remains open', async () => {
        const { rerender } = render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['zip-bytes'], 'test.zip', { type: 'application/zip' });

        await user.upload(fileInput, file);

        expect(screen.getByText('test.zip')).toBeInTheDocument();

        rerender(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        expect(screen.getByText('test.zip')).toBeInTheDocument();
    });
});
