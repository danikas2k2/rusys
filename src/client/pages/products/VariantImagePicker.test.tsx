import { fireEvent, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { VariantImagePicker } from '~/client/pages/products/VariantImagePicker';
import { useSetVariantImage } from '~/client/state/products/useSetVariantImage';

vi.mock(import('~/client/state/products/useSetVariantImage'));
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
    afterEach(() => vi.clearAllMocks());

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

    it('uploads a dropped image', async () => {
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

        expect(setVariantImage).toHaveBeenCalledWith(
            'Uogienės',
            'Braškės',
            '0.5l',
            expect.stringMatching(/^data:image\/png;base64,/)
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

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Failed to upload');
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

        expect(setVariantImage).toHaveBeenCalledWith('Uogienės', 'Braškės', '0.5l', '');
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

        await expect(screen.findByRole('alert')).resolves.toHaveTextContent('Failed to remove');
    });
});
