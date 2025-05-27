import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { VariantBox } from '~/client/variants/dialogs/VariantBox';
import { useRenameVariant } from '~/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/state/variants/useUpdateVariant';

jest.mock('~/client/common/Label');
jest.mock('~/state/variants/useRenameVariant');
jest.mock('~/state/variants/useUpdateVariant');

describe('<VariantBox>', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with cancel button', () => {
        render(
            <MockRedux state={state}>
                <VariantBox onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockRedux state={state}>
                <VariantBox onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByText('Add new variant')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockRedux state={state}>
                <VariantBox variant="Initial Variant" onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByText('Edit variant')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('Initial Variant');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('renders with group name', () => {
        render(
            <MockRedux state={state}>
                <VariantBox group="Daržovės" onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveDisplayValue('Daržovės');
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockRedux state={state}>
                <VariantBox onClose={onClose} />
            </MockRedux>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls update details handler when adding a new entry', () => {
        const updateVariant = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockResolvedValue(true));
            render(
                <MockRedux state={state}>
                    <VariantBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.type(screen.getByRole('textbox', { name: 'Long label' }), '4.5 l.');
            await userEvent.type(screen.getByRole('textbox', { name: 'Short label' }), '4½');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { long: '4.5 l.', short: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockRejectedValueOnce('Failed to update'));
            render(
                <MockRedux state={state}>
                    <VariantBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { long: '', short: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);
            render(
                <MockRedux state={state}>
                    <VariantBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);
            render(
                <MockRedux state={state}>
                    <VariantBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), 'd');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant already exists');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        const renameVariant = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant.mockResolvedValueOnce(true));
            render(
                <MockRedux state={state}>
                    <VariantBox group="Daržovės" variant="d" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.clear(screen.getByRole('textbox', { name: 'Long label' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Long label' }), '4.5 l.');
            await userEvent.clear(screen.getByRole('textbox', { name: 'Short label' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Short label' }), '4½');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { long: '4.5 l.', short: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant.mockRejectedValueOnce('Failed to rename'));
            render(
                <MockRedux state={state}>
                    <VariantBox group="Daržovės" variant="d" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { long: '3 l.', short: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);
            render(
                <MockRedux state={state}>
                    <VariantBox group="Daržovės" variant="d" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);
            render(
                <MockRedux state={state}>
                    <VariantBox group="Daržovės" variant="d" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), 'x');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.queryByRole('alert')).toHaveTextContent('Variant already exists');
        });

        it('closes without updating when name was not changed', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);
            render(
                <MockRedux state={state}>
                    <VariantBox group="Daržovės" variant="d" onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'd');
        });
    });
});
