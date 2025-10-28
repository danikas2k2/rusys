import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { MockPage } from '@tests/MockPage';

import React from 'react';

import { ImportBox } from '~/client/dialogs/ImportBox';
import { useImportHandler } from '~/client/hooks/useImportHandler';

jest.mock('~/client/common/Label');
jest.mock('~/client/hooks/useLabel', () => ({
    useLabel: jest.fn((key: string) => key),
}));
jest.mock('~/client/hooks/useImportHandler');
jest.mock('@mantine/dropzone', () => {
    const DropzoneComponent = ({
        onDrop,
        children,
    }: {
        onDrop: (files: File[]) => void;
        children: React.ReactNode;
    }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                onDrop(Array.from(e.target.files));
            }
        };
        return (
            <div>
                <input type="file" placeholder="Please choose a file" onChange={handleChange} />
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

    beforeEach(() => jest.mocked(useImportHandler).mockReturnValue(jest.fn().mockResolvedValue({ ok: true })));

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
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
