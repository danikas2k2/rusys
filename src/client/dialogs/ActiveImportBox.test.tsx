import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveImportBox } from '~/client/dialogs/ActiveImportBox';
import { ImportBox } from '~/client/dialogs/ImportBox';

vi.mock('~/client/dialogs/ImportBox', async () => ({
    ImportBox: vi.fn(() => <div>ImportBox</div>),
}));

describe('<ActiveImportBox>', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders ImportBox when action is import', () => {
        render(
            <MockThemeActive active={{ action: 'import' }}>
                <ActiveImportBox />
            </MockThemeActive>
        );

        expect(screen.getByText('ImportBox')).toBeInTheDocument();
        expect(ImportBox).toHaveBeenCalledWith(
            expect.objectContaining({
                opened: true,
                onClose: expect.any(Function),
            }),
            undefined
        );
    });

    it('does not render ImportBox when action is not import', () => {
        render(
            <MockThemeActive active={{ action: 'update' }}>
                <ActiveImportBox />
            </MockThemeActive>
        );

        expect(screen.getByText('ImportBox')).toBeInTheDocument();
        expect(ImportBox).toHaveBeenCalledWith(
            expect.objectContaining({
                opened: false,
                onClose: expect.any(Function),
            }),
            undefined
        );
    });

    it('does not render ImportBox when active is undefined', () => {
        render(
            <MockThemeActive>
                <ActiveImportBox />
            </MockThemeActive>
        );

        expect(screen.getByText('ImportBox')).toBeInTheDocument();
        expect(ImportBox).toHaveBeenCalledWith(
            expect.objectContaining({
                opened: false,
                onClose: expect.any(Function),
            }),
            undefined
        );
    });

    it('calls setActive when onClose is called', () => {
        let mockClose: (() => void) | null = null;
        vi.mocked(ImportBox).mockImplementation(({ onClose }: { onClose?: () => void }) => {
            mockClose = onClose ?? null;
            return <div>ImportBox</div>;
        });

        const mockSetActive = vi.fn();

        render(
            <MockThemeActive active={{ action: 'import' }} setActive={mockSetActive}>
                <ActiveImportBox />
            </MockThemeActive>
        );

        mockClose!();

        expect(mockSetActive).toHaveBeenCalledWith();
    });
});
