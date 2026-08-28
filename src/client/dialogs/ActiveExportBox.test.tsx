import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveExportBox } from '~/client/dialogs/ActiveExportBox';
import { useExportHandler } from '~/client/hooks/useExportHandler';

vi.mock(import('~/client/hooks/useExportHandler'));
vi.mock(import('~/client/common/ConfirmationDialog'), (): any => ({
    ConfirmationDialog: ({ opened, onClose, onConfirm, title, children }: any) =>
        opened ? (
            <dialog open aria-label="Confirmation">
                <div>{title}</div>
                <div>{children}</div>
                <button onClick={onClose}>Cancel</button>
                <button onClick={onConfirm}>Confirm</button>
            </dialog>
        ) : null,
}));

describe('<ActiveExportBox>', () => {
    const mockExportHandler = vi.fn();

    beforeEach(() => {
        vi.mocked(useExportHandler).mockReturnValue(mockExportHandler);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders closed when action is not export', () => {
        render(
            <MockThemeActive>
                <div />
            </MockThemeActive>
        );

        expect(screen.queryByRole('dialog', { name: 'Confirmation' })).not.toBeInTheDocument();
    });

    it('renders opened when action is export', () => {
        render(
            <MockThemeActive active={{ action: 'export' }}>
                <ActiveExportBox />
            </MockThemeActive>
        );

        expect(screen.getByRole('dialog', { name: 'Confirmation' })).toBeInTheDocument();
        expect(screen.getByText('Export data?')).toBeInTheDocument();
        expect(screen.getByText('This will download all your data as a file.')).toBeInTheDocument();
    });

    it('calls setActive on cancel', async () => {
        const mockSetActive = vi.fn();

        render(
            <MockThemeActive active={{ action: 'export' }} setActive={mockSetActive}>
                <ActiveExportBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(mockSetActive).toHaveBeenCalledWith();
    });

    it('calls handleExport on confirm', async () => {
        mockExportHandler.mockResolvedValue(undefined);

        render(
            <MockThemeActive active={{ action: 'export' }}>
                <ActiveExportBox />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(mockExportHandler).toHaveBeenCalledWith();
    });
});
