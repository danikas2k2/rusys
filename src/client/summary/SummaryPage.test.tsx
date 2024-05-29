import { render, screen } from '@testing-library/react';
import React from 'react';
import { SummaryPage } from '~/client/summary/SummaryPage';

jest.mock('~/client/summary/SummaryTable', () => ({
    SummaryTable: () => <div>SummaryTable</div>,
}));
jest.mock('~/client/toolbar/Toolbar', () => ({
    Toolbar: () => <div>Toolbar</div>,
}));

describe('SummaryPage', () => {
    it('renders into the document', () => {
        render(<SummaryPage />);
        expect(screen.getByText('SummaryTable')).toBeInTheDocument();
        expect(screen.getByText('Toolbar')).toBeInTheDocument();
    });
});
