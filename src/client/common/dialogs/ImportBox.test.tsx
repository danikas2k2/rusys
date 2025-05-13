import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { ImportBox } from '~/client/common/dialogs/ImportBox';
import { useImport } from '~/state/common/useImport';
import { useAddVariant } from '~/state/variants/useAddVariant';

jest.mock('~/client/common/Label');
jest.mock('~/state/common/useImport');

describe('<ImportBox>', () => {
    const state = {
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
    };

    const onClose = jest.fn();

    afterEach(() => jest.clearAllMocks());

    it('renders with cancel button', () => {
        render(
            <MockRedux state={state}>
                <ImportBox onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockRedux state={state}>
                <ImportBox onClose={onClose} />
            </MockRedux>
        );

        expect(screen.getByPlaceholderText('Please choose a file')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockRedux state={state}>
                <ImportBox onClose={onClose} />
            </MockRedux>
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls import details handler when importing a file', () => {
        const importData = jest.fn();

        it('closes dialog without error when successfully imported', async () => {
            jest.mocked(useImport).mockReturnValue(importData.mockResolvedValue(true));
            render(
                <MockRedux state={state}>
                    <ImportBox onClose={onClose} />
                </MockRedux>
            );

            const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
            const file = new File(['{"data":[]}'], 'test.json', { type: 'application/json' });
            await userEvent.upload(fileInput, file);

            expect(fileInput.files).toHaveLength(1);
            expect(fileInput.files?.[0]).toStrictEqual(file);

            await userEvent.click(screen.getByRole('button', { name: 'Import' }));

            expect(importData).toHaveBeenCalledWith(
                expect.objectContaining({
                    import: expect.anything() /*expect.objectContaining({
                        name: 'test.json',
                        size: 5,
                        type: 'application/json',
                    })*/,
                })
            );
            expect(onClose).toHaveBeenCalledWith('Daržovės', '4.5');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when adding fails', async () => {
            jest.mocked(useAddVariant).mockReturnValue(importData.mockRejectedValueOnce('Failed to add'));
            render(
                <MockRedux state={state}>
                    <ImportBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), '4.5');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(importData).toHaveBeenCalledWith('Daržovės', '4.5', { long: '', short: '' });
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            jest.mocked(useAddVariant).mockReturnValue(importData);
            render(
                <MockRedux state={state}>
                    <ImportBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(importData).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            jest.mocked(useAddVariant).mockReturnValue(importData);
            render(
                <MockRedux state={state}>
                    <ImportBox onClose={onClose} />
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('textbox', { name: 'Group' }));
            await userEvent.click(screen.getByRole('option', { name: 'Daržovės' }));
            await userEvent.type(screen.getByRole('textbox', { name: 'Variant name' }), 'd');
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));

            expect(importData).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Variant name' })).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Variant already exists');
        });
    });
});
