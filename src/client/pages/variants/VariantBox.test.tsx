import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { VariantBox } from '~/client/pages/variants/VariantBox';
import { useRenameVariant } from '~/client/state/variants/useRenameVariant';
import { useUpdateVariant } from '~/client/state/variants/useUpdateVariant';

jest.mock('~/client/common/Label');
jest.mock('~/client/state/variants/useRenameVariant');
jest.mock('~/client/state/variants/useUpdateVariant');

describe('<VariantBox>', () => {
    beforeAll(() => {
        // Mock scrollIntoView for Mantine Combobox (not available in JSDOM)
        Element.prototype.scrollIntoView = () => {};
    });

    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with cancel button', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial values', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Add new variant' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('');
        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial values', () => {
        render(
            <MockApp state={state}>
                <VariantBox opened variant="Litriukas" group="Daržovės" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Edit variant' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveValue('Litriukas');
        expect(screen.getByRole('textbox', { name: 'Group' })).toHaveValue('Daržovės');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockApp state={state}>
                <VariantBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls update details handler when adding a new entry', () => {
        const updateVariant = jest.fn();

        it('closes dialog without error when successfully added', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), '4½');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { suffix: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant.mockRejectedValueOnce('Failed to add'));

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).toHaveBeenCalledWith('Daržovės', '4.5', { suffix: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(updateVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useUpdateVariant).mockReturnValue(updateVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'd');
            await user.click(screen.getByRole('button', { name: 'Add' }));

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
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.clear(screen.getByRole('textbox', { name: 'Suffix' }));
            await user.type(screen.getByRole('textbox', { name: 'Suffix' }), '4½');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { suffix: '4½' });
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant.mockRejectedValueOnce('Failed to rename'));

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).toHaveBeenCalledWith('Daržovės', 'd', '4.5', { suffix: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant name is required');
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.clear(screen.getByRole('textbox', { name: 'Variant name' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'x');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.queryByRole('alert')).toHaveTextContent('Variant already exists');
        });

        it('closes without updating when name was not changed', async () => {
            jest.mocked(useRenameVariant).mockReturnValue(renameVariant);

            render(
                <MockApp state={state}>
                    <VariantBox opened group="Daržovės" variant="d" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameVariant).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės', 'd');
        });
    });

    describe('validation', () => {
        it('displays error when group is empty', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Group' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Group is required');
        });

        it('displays error when variant contains colon', async () => {
            render(
                <MockApp state={state}>
                    <VariantBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('textbox', { name: 'Group' }));
            await user.click(await screen.findByRole('option', { name: 'Daržovės' }));
            await user.type(screen.getByRole('textbox', { name: 'Variant name' }), 'test:variant');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });
    });
});
