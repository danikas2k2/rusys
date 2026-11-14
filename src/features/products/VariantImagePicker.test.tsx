import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useSetVariantImage } from '~/features/products/hooks/useSetVariantImage';
import { VariantImagePicker } from '~/features/products/VariantImagePicker';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
import { dropImageAction } from '~/server/actions/images';

vi.mock(import('~/features/products/hooks/useSetVariantImage'));
vi.mock(import('~/lib/utils/uploadWithProgress'));
vi.mock(import('~/server/actions/images'));
vi.mock(import('@mantine/dropzone'), (): any => {
    const DropzoneComponent = ({
        onDrop,
        onReject,
        children,
    }: {
        onDrop: (files: File[]) => void;
        onReject?: (fileRejections: unknown[]) => void;
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
        return (
            <div>
                <input type="file" placeholder="Please choose an image" onChange={handleChange} />
                <button type="button" onClick={handleReject} aria-label="Reject image">
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

describe('<VariantImagePicker>', () => {
    beforeEach(() => {
        vi.mocked(dropImageAction).mockResolvedValue(undefined);
        vi.mocked(uploadWithProgress).mockImplementation(async (_method, _url, _body, progress, response) => {
            progress?.(100);
            response?.(JSON.stringify({ token }));
        });
    });

    afterEach(() => vi.clearAllMocks());

    it('does not assign an image if its upload finishes after unmount', async () => {
        let finish: () => void = () => undefined;
        vi.mocked(uploadWithProgress).mockImplementationOnce(
            (_method, _url, _body, _progress, response) =>
                new Promise<void>((resolve) => {
                    finish = () => {
                        response?.(JSON.stringify({ token }));
                        resolve();
                    };
                })
        );
        const setVariantImage = vi.fn();
        vi.mocked(useSetVariantImage).mockReturnValue(setVariantImage);
        const { unmount } = render(
            <MockApp>
                <VariantImagePicker group="Fruit" name="Berry" variant="Jar" />
            </MockApp>
        );
        await user.upload(
            screen.getByPlaceholderText('Please choose an image'),
            new File(['image'], 'image.png', { type: 'image/png' })
        );
        await waitFor(() => expect(uploadWithProgress).toHaveBeenCalledTimes(1));
        unmount();
        await act(async () => finish());

        expect(setVariantImage).not.toHaveBeenCalled();
        expect(dropImageAction).toHaveBeenCalledWith(token);
    });

    const token = `upload:${'a'.repeat(64)}`;

    it('does not render a remove button when no image is set', () => {
        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" />
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
    });

    it('renders a remove button when an image is set', () => {
        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" image="/images/ab/cd/v.png" />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument();
    });

    it('falls back to a photo icon when the image fails to load', () => {
        const { container } = render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" image="/images/ab/cd/v.png" />
            </MockApp>
        );

        fireEvent.error(container.querySelector('img')!);

        expect(container.querySelector('.tabler-icon-photo')).toBeInTheDocument();
    });

    it('uploads a dropped image separately and assigns its token', async () => {
        const setVariantImage = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useSetVariantImage).mockReturnValue(setVariantImage);

        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" />
            </MockApp>
        );

        const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
        const file = new File(['image-data'], 'image.png', { type: 'image/png' });
        await user.upload(imageInput, file);

        await waitFor(() =>
            expect(setVariantImage).toHaveBeenCalledExactlyOnceWith({
                group: 'Uogienės',
                name: 'Braškės',
                variant: '0.5l',
                image: token,
            })
        );

        expect(uploadWithProgress).toHaveBeenCalledExactlyOnceWith(
            'POST',
            '/api/images',
            JSON.stringify({ image: `data:image/png;base64,${btoa('image-data')}` }),
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('shows an error when the dropped file is rejected', async () => {
        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Reject image' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Choose a valid image file');
    });

    it('shows an error when the upload fails', async () => {
        const setVariantImage = vi.fn();
        vi.mocked(useSetVariantImage).mockReturnValue(setVariantImage);
        vi.mocked(uploadWithProgress).mockRejectedValueOnce(new Error(SchemaError.UploadFailed));

        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" />
            </MockApp>
        );

        const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
        await user.upload(imageInput, new File(['image-data'], 'image.png', { type: 'image/png' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent(SchemaError.UploadFailed);
        expect(setVariantImage).not.toHaveBeenCalled();
    });

    it('shows an error when assigning the uploaded token fails', async () => {
        const setVariantImage = vi.fn().mockRejectedValueOnce('Failed to upload');
        vi.mocked(useSetVariantImage).mockReturnValue(setVariantImage);

        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" />
            </MockApp>
        );

        const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
        const file = new File(['image-data'], 'image.png', { type: 'image/png' });
        await user.upload(imageInput, file);

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Something went wrong');
        expect(setVariantImage).toHaveBeenCalledExactlyOnceWith({
            group: 'Uogienės',
            name: 'Braškės',
            variant: '0.5l',
            image: token,
        });
    });

    it('removes the image when the remove button is clicked', async () => {
        const setVariantImage = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useSetVariantImage).mockReturnValue(setVariantImage);

        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" image="/images/ab/cd/v.png" />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove image' }));

        expect(setVariantImage).toHaveBeenCalledWith({
            group: 'Uogienės',
            name: 'Braškės',
            variant: '0.5l',
            image: '',
        });
    });

    it('shows an error when removing the image fails', async () => {
        const setVariantImage = vi.fn().mockRejectedValueOnce('Failed to remove');
        vi.mocked(useSetVariantImage).mockReturnValue(setVariantImage);

        render(
            <MockApp>
                <VariantImagePicker group="Uogienės" name="Braškės" variant="0.5l" image="/images/ab/cd/v.png" />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Remove image' }));

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Something went wrong');
    });
});
