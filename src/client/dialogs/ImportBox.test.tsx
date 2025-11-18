import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockPage } from '@tests/MockPage';

import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ImportBox } from '~/client/dialogs/ImportBox';
import { useImportHandler } from '~/client/hooks/useImportHandler';

jest.mock('~/client/common/Label');
jest.mock('~/client/hooks/useLabel', () => ({
    useLabel: jest.fn((key: string) => key),
}));
jest.mock('~/client/hooks/useImportHandler');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('@mantine/dropzone', () => {
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

    const onClose = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        jest.mocked(useImportHandler).mockReturnValue(jest.fn().mockResolvedValue({ ok: true }));
        jest.mocked(useNavigate).mockReturnValue(navigate);
    });

    afterEach(() => jest.clearAllMocks());

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

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('calls import details handler when importing a file', () => {
        it('closes dialog without error when successfully imported', async () => {
            const importData = jest.fn().mockResolvedValue({ ok: true });
            jest.mocked(useImportHandler).mockReturnValue(importData);

            render(
                <MockPage state={state}>
                    <ImportBox opened onClose={onClose} />
                </MockPage>
            );

            const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
            const file = new File(['{"data":[]}'], 'test.json', { type: 'application/json' });

            await user.upload(fileInput, file);

            expect(fileInput.files).toHaveLength(1);
            expect(fileInput.files?.[0]).toStrictEqual(file);

            await user.click(screen.getByRole('button', { name: 'Import' }));

            expect(importData).toHaveBeenCalledWith(expect.any(FormData));
            expect(importData.mock.calls[0][0].get('import')).toStrictEqual(file);
            expect(onClose).toHaveBeenCalledWith();
            expect(navigate).toHaveBeenCalledWith(0);
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

        expect(screen.getByRole('alert')).toHaveTextContent('Choose a valid JSON file');
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
        const importData = jest.fn().mockResolvedValue({ ok: false, error: 'Import failed' });
        jest.mocked(useImportHandler).mockReturnValue(importData);

        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['{"data":[]}'], 'test.json', { type: 'application/json' });

        await user.upload(fileInput, file);
        await user.click(screen.getByRole('button', { name: 'Import' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Import failed');
    });

    it('shows default error message when import fails without error', async () => {
        const importData = jest.fn().mockResolvedValue({ ok: false });
        jest.mocked(useImportHandler).mockReturnValue(importData);

        render(
            <MockPage state={state}>
                <ImportBox opened onClose={onClose} />
            </MockPage>
        );

        const fileInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose a file');
        const file = new File(['{"data":[]}'], 'test.json', { type: 'application/json' });

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

        await user.upload(fileInput, []);

        expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
    });

    it('shows file size warning when file exceeds max size', async () => {
        const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.json', { type: 'application/json' });
        Object.defineProperty(largeFile, 'length', { value: 11 * 1024 * 1024, writable: false, configurable: true });

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
});
