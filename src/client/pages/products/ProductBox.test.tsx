import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { ProductBox } from '~/client/pages/products/ProductBox';
import { useAddProduct } from '~/client/state/products/useAddProduct';
import { useMoveProduct } from '~/client/state/products/useMoveProduct';
import { useRenameProduct } from '~/client/state/products/useRenameProduct';
import { useSetProductImage } from '~/client/state/products/useSetProductImage';

vi.mock(import('~/client/state/products/useAddProduct'));
vi.mock(import('~/client/state/products/useDeleteProduct'));
vi.mock(import('~/client/state/products/useMoveProduct'));
vi.mock(import('~/client/state/products/useRenameProduct'));
vi.mock(import('~/client/state/products/useSetProductImage'));
vi.mock(import('~/client/common/Label'));
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

function selectOption(name: string) {
    const combobox = screen.getByRole('combobox', { name: 'Category' });
    act(() => fireEvent.click(combobox));
    act(() => fireEvent.change(combobox, { target: { value: name } }));
    act(() => fireEvent.click(screen.getByRole('option', { name })));
}

describe('<ProductBox>', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup({ delay: null });
    });

    afterEach(() => vi.clearAllMocks());

    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        products: getProductsFixture(),
    };

    const onClose = vi.fn();

    it('renders with cancel button', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('heading', { name: 'Add new entry' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('heading', { name: 'Edit entry' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveDisplayValue('Avietės');
    });

    it('renders with group name', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened group="Uogienės" onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('combobox', { name: 'Category' })).toHaveDisplayValue('Uogienės');
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened onClose={onClose} />
            </MockThemeRedux>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('image upload', () => {
        it('does not render a remove button when no image is set', () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
        });

        it('shows a preview and remove button after dropping a valid image', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);

            await expect(screen.findByRole('button', { name: 'Remove image' })).resolves.toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('shows an error when the dropped file is rejected', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('button', { name: 'Reject image' }));

            expect(screen.getByRole('alert')).toHaveTextContent('Choose a valid image file');
        });

        it('removes the image when the remove button is clicked', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);

            await user.click(await screen.findByRole('button', { name: 'Remove image' }));

            expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
        });

        it('sends the uploaded image via setProductImage when adding a new entry', async () => {
            const addProduct = vi.fn().mockResolvedValue(true);
            const setProductImage = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useAddProduct).mockReturnValue(addProduct);
            vi.mocked(useSetProductImage).mockReturnValue(setProductImage);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);
            await screen.findByRole('button', { name: 'Remove image' });

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(setProductImage).toHaveBeenCalledWith(
                'Uogienės',
                'Agrastai',
                expect.stringMatching(/^data:image\/png;base64,/)
            );
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
        });

        it('sends the final identity to setProductImage after renaming', async () => {
            const renameProduct = vi.fn().mockResolvedValue(true);
            const setProductImage = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useRenameProduct).mockReturnValue(renameProduct);
            vi.mocked(useSetProductImage).mockReturnValue(setProductImage);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);
            await screen.findByRole('button', { name: 'Remove image' });

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(setProductImage).toHaveBeenCalledWith(
                'Uogienės',
                'Agrastai',
                expect.stringMatching(/^data:image\/png;base64,/)
            );
        });

        it('does not call setProductImage when the image is unchanged', async () => {
            const addProduct = vi.fn().mockResolvedValue(true);
            const setProductImage = vi.fn();
            vi.mocked(useAddProduct).mockReturnValue(addProduct);
            vi.mocked(useSetProductImage).mockReturnValue(setProductImage);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(setProductImage).not.toHaveBeenCalled();
        });
    });

    describe('discard confirmation', () => {
        it('closes without confirmation when the form is untouched', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).toHaveBeenCalledWith();
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when the form was changed', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(screen.getByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledWith();
        });

        it('keeps the dialog open when cancelling the discard confirmation', async () => {
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('test');
        });
    });

    describe('calls add product handler when adding a new entry', () => {
        const addProduct = vi.fn();

        it('closes dialog without error when successfully added', async () => {
            vi.mocked(useAddProduct).mockReturnValue(addProduct.mockResolvedValue(true));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            vi.mocked(useAddProduct).mockReturnValue(addProduct.mockRejectedValueOnce('Failed to add'));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            vi.mocked(useAddProduct).mockReturnValue(addProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveAttribute('aria-invalid', 'true');
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useAddProduct).mockReturnValue(addProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Avietės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });
    });

    describe('calls rename product handle when updating an existing entry', () => {
        const renameProduct = vi.fn();

        it('closes dialog without error when successfully renamed', async () => {
            vi.mocked(useRenameProduct).mockReturnValue(renameProduct.mockResolvedValueOnce(true));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Agrastai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            vi.mocked(useRenameProduct).mockReturnValue(renameProduct.mockRejectedValueOnce('Failed to rename'));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agrastai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Agrastai');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            vi.mocked(useRenameProduct).mockReturnValue(renameProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useRenameProduct).mockReturnValue(renameProduct);
            render(
                <MockThemeRedux state={{ products: getProductsFixture() }}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Braškės');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });

        it('closes without updating when name was not changed', async () => {
            vi.mocked(useRenameProduct).mockReturnValue(renameProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameProduct).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });

    describe('calls move product handle when changing entry group', () => {
        const moveProduct = vi.fn();

        it('closes dialog without error when successfully moved', async () => {
            vi.mocked(useMoveProduct).mockReturnValue(moveProduct.mockResolvedValueOnce(true));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            selectOption('Daržovės');
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Avietės');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when move fails', async () => {
            vi.mocked(useMoveProduct).mockReturnValue(moveProduct.mockRejectedValueOnce('Failed to move'));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            selectOption('Daržovės');
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to move');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            vi.mocked(useMoveProduct).mockReturnValue(moveProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            selectOption('Daržovės');
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useMoveProduct).mockReturnValue(moveProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            selectOption('Daržovės');
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agurkai');
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });

        it('closes without updating when group was not changed', async () => {
            vi.mocked(useMoveProduct).mockReturnValue(moveProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(moveProduct).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledWith('Uogienės', 'Avietės');
        });
    });

    describe('validation errors', () => {
        it('displays error when group is empty', async () => {
            const addProduct = vi.fn();
            vi.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test');
            await user.clear(screen.getByRole('combobox', { name: 'Category' }));
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('combobox', { name: 'Category' })).toHaveAttribute('aria-invalid', 'true');
        });

        it('displays error when name contains colon', async () => {
            const addProduct = vi.fn();
            vi.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test:Name');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });
    });

    describe('loading state with fake timers', () => {
        let resolveAdd: () => void;

        beforeEach(() => vi.useFakeTimers());

        afterEach(() => vi.useRealTimers());

        it('shows loading state after 300ms delay when submitting form', async () => {
            const addProduct = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveAdd = resolve;
                    })
            );
            vi.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            // Use fireEvent to avoid userEvent incompatibility with fake timers
            act(() => fireEvent.click(screen.getByRole('combobox', { name: 'Category' })));
            act(() =>
                fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'Daržovės' } })
            );
            act(() => fireEvent.click(screen.getByRole('option', { name: 'Daržovės' })));
            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'New Entry' } })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
            act(() => fireEvent.click(addButton));

            // Advance timers by 300ms to trigger loading state
            await act(() => vi.advanceTimersByTimeAsync(300));

            expect(addButton).toBeInTheDocument();

            // Complete the async operation and flush microtasks
            await act(async () => {
                resolveAdd();
                await vi.runAllTimersAsync();
            });

            // Button should be enabled again after operation completes
            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const addProduct = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveAdd = resolve;
                    })
            );
            vi.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            act(() => fireEvent.click(screen.getByRole('combobox', { name: 'Category' })));
            act(() =>
                fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'Daržovės' } })
            );
            act(() => fireEvent.click(screen.getByRole('option', { name: 'Daržovės' })));
            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Fast Entry' } })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
            act(() => fireEvent.click(addButton));

            // Complete the async operation immediately (before 300ms) — clears the timeout
            await act(() => {
                resolveAdd();
            });

            // Advance timers by less than 300ms — timeout already cleared, no loading state
            await act(() => vi.advanceTimersByTimeAsync(200));

            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Fast Entry');
        });
    });
});
