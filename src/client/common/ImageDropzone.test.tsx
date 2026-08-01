import { fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { ImageDropzone } from '~/client/common/ImageDropzone';
import { MAX_IMAGE_FILE_MB } from '~/common/utils/files';

vi.mock(import('@mantine/dropzone'), (): any => {
    const DropzoneComponent = ({
        onDrop,
        onReject,
        disabled,
        children,
    }: {
        onDrop: (files: File[]) => void;
        onReject?: (fileRejections: unknown[]) => void;
        disabled?: boolean;
        children: React.ReactNode;
    }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                onDrop(Array.from(e.target.files));
            }
        };
        const handleReject = () => {
            onReject?.([{ file: new File([], 'x'), errors: [{ code: 'file-invalid-type', message: 'Invalid type' }] }]);
        };
        const handleRejectTooLarge = () => {
            onReject?.([{ file: new File([], 'x'), errors: [{ code: 'file-too-large', message: 'Too large' }] }]);
        };
        return (
            <div>
                <input type="file" placeholder="Please choose an image" disabled={disabled} onChange={handleChange} />
                <button type="button" onClick={handleReject} aria-label="Reject image">
                    Reject
                </button>
                <button type="button" onClick={handleRejectTooLarge} aria-label="Reject oversized image">
                    Reject oversized
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

describe('<ImageDropzone>', () => {
    afterEach(() => vi.clearAllMocks());

    it('does not render a remove button when no image is set', () => {
        render(
            <MockApp>
                <ImageDropzone label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
    });

    it('renders a remove button when an image is set', () => {
        render(
            <MockApp>
                <ImageDropzone image="/images/ab/cd/v.png" label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument();
    });

    it('falls back to a photo icon when the image fails to load', () => {
        const { container } = render(
            <MockApp>
                <ImageDropzone image="/images/ab/cd/v.png" label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(container.querySelector('.tabler-icon-photo')).toBeInTheDocument();
    });

    it('calls onDrop with a data URL for a dropped image', async () => {
        const onDrop = vi.fn().mockResolvedValue(undefined);

        render(
            <MockApp>
                <ImageDropzone label="Category image" onDrop={onDrop} onRemove={vi.fn()} />
            </MockApp>
        );

        const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
        const file = new File(['image-data'], 'image.png', { type: 'image/png' });
        await user.upload(imageInput, file);

        expect(onDrop).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/png;base64,/));
    });

    it('shows the maximum file size when no image is set', () => {
        render(
            <MockApp>
                <ImageDropzone label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        expect(screen.getByText(`${MAX_IMAGE_FILE_MB}MB`, { exact: false })).toBeInTheDocument();
    });

    it('does not show the maximum file size when an image is set', () => {
        render(
            <MockApp>
                <ImageDropzone image="/images/ab/cd/v.png" label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        expect(screen.queryByText(`${MAX_IMAGE_FILE_MB}MB`, { exact: false })).not.toBeInTheDocument();
    });

    it('shows an error when the dropped file is rejected', async () => {
        render(
            <MockApp>
                <ImageDropzone label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Reject image' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Choose a valid image file');
    });

    it('shows an error mentioning the maximum size when the dropped file is too large', async () => {
        render(
            <MockApp>
                <ImageDropzone label="Category image" onDrop={vi.fn()} onRemove={vi.fn()} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Reject oversized image' }));

        expect(screen.getByRole('alert')).toHaveTextContent(`${MAX_IMAGE_FILE_MB}MB`);
    });

    it('shows an error when onDrop rejects', async () => {
        const onDrop = vi.fn().mockRejectedValueOnce('Failed to upload');

        render(
            <MockApp>
                <ImageDropzone label="Category image" onDrop={onDrop} onRemove={vi.fn()} />
            </MockApp>
        );

        const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
        const file = new File(['image-data'], 'image.png', { type: 'image/png' });
        await user.upload(imageInput, file);

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Failed to upload');
    });

    it('calls onRemove when the remove button is clicked', async () => {
        const onRemove = vi.fn().mockResolvedValue(undefined);

        render(
            <MockApp>
                <ImageDropzone
                    image="/images/ab/cd/v.png"
                    label="Category image"
                    onDrop={vi.fn()}
                    onRemove={onRemove}
                />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove image' }));

        expect(onRemove).toHaveBeenCalledWith();
    });

    it('shows an error when onRemove rejects', async () => {
        const onRemove = vi.fn().mockRejectedValueOnce('Failed to remove');

        render(
            <MockApp>
                <ImageDropzone
                    image="/images/ab/cd/v.png"
                    label="Category image"
                    onDrop={vi.fn()}
                    onRemove={onRemove}
                />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove image' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Failed to remove');
    });

    it('disables the dropzone and remove button while disabled', () => {
        render(
            <MockApp>
                <ImageDropzone
                    image="/images/ab/cd/v.png"
                    label="Category image"
                    onDrop={vi.fn()}
                    onRemove={vi.fn()}
                    disabled
                />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('Please choose an image')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Remove image' })).toBeDisabled();
    });
});
