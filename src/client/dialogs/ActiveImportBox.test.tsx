import { render, screen } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveImportBox } from '~/client/dialogs/ActiveImportBox';
import { ImportBox } from '~/client/dialogs/ImportBox';

jest.mock('~/client/dialogs/ImportBox', () => ({
    ImportBox: jest.fn(() => <div>ImportBox</div>),
}));

describe('<ActiveImportBox>', () => {
    afterEach(() => jest.clearAllMocks());

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

    it('calls setActive when onClose is called', () => {
        let mockClose: (() => void) | null = null;
        jest.mocked(ImportBox).mockImplementation(({ onClose }) => {
            mockClose = onClose;
            return <div>ImportBox</div>;
        });

        const mockSetActive = jest.fn();

        render(
            <MockThemeActive active={{ action: 'import' }} setActive={mockSetActive}>
                <ActiveImportBox />
            </MockThemeActive>
        );

        mockClose!();

        expect(mockSetActive).toHaveBeenCalledWith();
    });
});
