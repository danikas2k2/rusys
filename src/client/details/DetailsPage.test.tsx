import { render, screen } from '@testing-library/react';
import React from 'react';
import { DetailsPage } from '~/client/details/DetailsPage';

jest.mock('~/client/details/DetailsTable', () => ({
    DetailsTable: () => <div>DetailsTable</div>,
}));
jest.mock('~/client/toolbar/Toolbar', () => ({
    Toolbar: () => <div>Toolbar</div>,
}));

describe('DetailsPage', () => {
    it('renders into the document', () => {
        render(<DetailsPage />);
        expect(screen.getByText('DetailsTable')).toBeInTheDocument();
        expect(screen.getByText('Toolbar')).toBeInTheDocument();
    });
});
