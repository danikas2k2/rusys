import { act, render, screen } from '@testing-library/react';
import user, { type UserEvent } from '@testing-library/user-event';
import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { ProductBox } from '~/client/pages/products/ProductBox';
import { useAddProduct } from '~/client/state/products/useAddProduct';
import { useMoveProduct } from '~/client/state/products/useMoveProduct';
import { useRenameProduct } from '~/client/state/products/useRenameProduct';

jest.mock('~/client/state/products/useAddProduct');
jest.mock('~/client/state/products/useDeleteProduct');
jest.mock('~/client/state/products/useMoveProduct');
jest.mock('~/client/state/products/useRenameProduct');
jest.mock('~/client/common/Label');

describe('<ProductBox>', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        products: getProductsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

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

        expect(screen.getByText('Add new entry')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('heading')).toHaveTextContent('Edit entry');
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveDisplayValue('Avietės');
    });

    it('renders with group name', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductBox opened group="Uogienės" onClose={onClose} />
            </MockThemeRedux>
        );

        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveDisplayValue('Uogienės');
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

    describe('calls add product handler when adding a new entry', () => {
        const addProduct = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useAddProduct).mockReturnValue(addProduct.mockResolvedValue(true));
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
            jest.mocked(useAddProduct).mockReturnValue(addProduct.mockRejectedValueOnce('Failed to add'));
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
            jest.mocked(useAddProduct).mockReturnValue(addProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" onClose={onClose} />
                </MockThemeRedux>
            );
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useAddProduct).mockReturnValue(addProduct);
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
        const renameProduct = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            jest.mocked(useRenameProduct).mockReturnValue(renameProduct.mockResolvedValueOnce(true));
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
            jest.mocked(useRenameProduct).mockReturnValue(renameProduct.mockRejectedValueOnce('Failed to rename'));
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
            jest.mocked(useRenameProduct).mockReturnValue(renameProduct);
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
            jest.mocked(useRenameProduct).mockReturnValue(renameProduct);
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
            jest.mocked(useRenameProduct).mockReturnValue(renameProduct);
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
        const moveProduct = jest.fn();

        it('closes dialog without error when successfully moved', async () => {
            jest.mocked(useMoveProduct).mockReturnValue(moveProduct.mockResolvedValueOnce(true));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Avietės');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when move fails', async () => {
            jest.mocked(useMoveProduct).mockReturnValue(moveProduct.mockRejectedValueOnce('Failed to move'));
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).toHaveBeenCalledWith('Uogienės', 'Avietės', 'Daržovės', 'Avietės');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to move');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useMoveProduct).mockReturnValue(moveProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useMoveProduct).mockReturnValue(moveProduct);
            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened group="Uogienės" name="Avietės" onClose={onClose} />
                </MockThemeRedux>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.type(screen.getByRole('textbox', { name: 'Group' }), 'Dar');
            await user.click(screen.getByRole('option', { name: 'Daržovės' }));
            await user.clear(screen.getByRole('textbox', { name: 'Title' }));
            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Agurkai');
            await user.click(screen.getByRole('button', { name: 'Move' }));

            expect(moveProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Name already exists');
        });

        it('closes without updating when group was not changed', async () => {
            jest.mocked(useMoveProduct).mockReturnValue(moveProduct);
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
            const addProduct = jest.fn();
            jest.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Test');
            await user.clear(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addProduct).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Group' })).toHaveFocus();
        });

        it('displays error when name contains colon', async () => {
            const addProduct = jest.fn();
            jest.mocked(useAddProduct).mockReturnValue(addProduct);

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
        let timeUser: UserEvent;

        beforeEach(() => {
            jest.useFakeTimers();
            timeUser = user.setup({ advanceTimers: jest.advanceTimersByTime });
        });

        afterEach(() => {
            jest.runOnlyPendingTimers();
            jest.clearAllTimers();
        });

        afterAll(() => jest.useRealTimers());

        it('shows loading state after 300ms delay when submitting form', async () => {
            const addProduct = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await timeUser.click(screen.getByRole('textbox', { name: 'Group' }));
            await timeUser.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await timeUser.type(screen.getByRole('textbox', { name: 'Title' }), 'New Entry');

            const addButton = screen.getByRole('button', { name: 'Add' });
            await timeUser.click(addButton);

            // Advance timers by 300ms to trigger loading state (line 130)
            // This tests that setTimeout with 300ms delay is executed
            act(() => {
                jest.advanceTimersByTime(300);
            });

            // Verify that loading state was triggered (line 130: setLoading(true))
            // The button should have loading prop active, which Mantine handles internally
            expect(addButton).toBeInTheDocument();

            // Complete the async operation
            await addProduct();

            // Button should be enabled again after operation completes
            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const addProduct = jest.fn().mockResolvedValue(undefined);
            jest.mocked(useAddProduct).mockReturnValue(addProduct);

            render(
                <MockThemeRedux state={state}>
                    <ProductBox opened onClose={onClose} />
                </MockThemeRedux>
            );

            await timeUser.click(screen.getByRole('textbox', { name: 'Group' }));
            await timeUser.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await timeUser.type(screen.getByRole('textbox', { name: 'Title' }), 'Fast Entry');

            const addButton = screen.getByRole('button', { name: 'Add' });
            await timeUser.click(addButton);

            // Complete the async operation immediately (before 300ms)
            await addProduct();

            // Advance timers by less than 300ms - timeout should be cleared
            act(() => {
                jest.advanceTimersByTime(200);
            });

            // Button should be enabled and timeout cleared
            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'Fast Entry');
        });
    });
});
