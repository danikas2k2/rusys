import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { VariantBox } from '~/client/variants/dialogs/VariantBox';
import { useAddVariant } from '~/state/variants/useAddVariant';
import { useRenameVariant } from '~/state/variants/useRenameVariant';
import { getGroupsFixture, getVariantsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/common/Label');
jest.mock('~/state/variants/useAddVariant');
jest.mock('~/state/variants/useRenameVariant');

describe('VariantBox', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with cancel button', () => {
        render(<VariantBox onClose={onClose} />, withReduxState(state));
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(<VariantBox onClose={onClose} />, withReduxState(state));
        expect(screen.getByText('Add new variant')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(<VariantBox variant="Initial Variant" onClose={onClose} />, withReduxState(state));
        expect(screen.getByText('Edit variant')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('Initial Variant');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('renders with group name', () => {
        render(<VariantBox group="Daržovės" onClose={onClose} />, withReduxState(state));
        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveDisplayValue('Daržovės');
    });

    it('calls onClose when close button is clicked', async () => {
        render(<VariantBox onClose={onClose} />, withReduxState(state));
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls add details handler when adding a new entry', () => {
        const addVariant = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            (useAddVariant as jest.Mock).mockReturnValue(addVariant.mockResolvedValue(true));
            render(<VariantBox onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.type(screen.getByRole('textbox', { name: 'Long label' }), '4.5 l.');
            await userEvent.type(screen.getByRole('textbox', { name: 'Short label' }), '4½');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addVariant).toHaveBeenCalledWith('Daržovės', '4.5', { long: '4.5 l.', short: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            (useAddVariant as jest.Mock).mockReturnValue(addVariant.mockRejectedValueOnce('Failed to add'));
            render(<VariantBox onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addVariant).toHaveBeenCalledWith('Daržovės', '4.5', { long: '', short: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            (useAddVariant as jest.Mock).mockReturnValue(addVariant);
            render(<VariantBox onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            (useAddVariant as jest.Mock).mockReturnValue(addVariant);
            render(<VariantBox onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), 'd');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(addVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant already exists');
        });
    });

    describe('calls rename details handle when updating an existing entry', () => {
        const renameVariant = jest.fn();

        it('closes dialog without error when successfully renamed', async () => {
            (useRenameVariant as jest.Mock).mockReturnValue(renameVariant.mockResolvedValueOnce(true));
            render(<VariantBox group="Daržovės" variant="d" onClose={onClose} />, withReduxState(state));
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
            (useRenameVariant as jest.Mock).mockReturnValue(renameVariant.mockRejectedValueOnce('Failed to rename'));
            render(<VariantBox group="Daržovės" variant="d" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { long: '3 l.', short: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            (useRenameVariant as jest.Mock).mockReturnValue(renameVariant);
            render(<VariantBox group="Daržovės" variant="d" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            (useRenameVariant as jest.Mock).mockReturnValue(renameVariant);
            render(<VariantBox group="Daržovės" variant="d" onClose={onClose} />, withReduxState(state));
            await userEvent.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), 'x');
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.queryByRole('alert')).toHaveTextContent('Variant already exists');
        });

        it('closes without updating when name was not changed', async () => {
            (useRenameVariant as jest.Mock).mockReturnValue(renameVariant);
            render(<VariantBox group="Daržovės" variant="d" onClose={onClose} />, withReduxState(state));
            await userEvent.click(screen.getByRole('button', { name: 'Update' }));
            expect(renameVariant).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'd');
        });
    });
});
