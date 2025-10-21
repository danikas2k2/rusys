import { render, screen } from '@testing-library/react';

import React from 'react';

import { DetailsPage } from '~/client/pages/details/DetailsPage';

jest.mock('~/client/pages/details/DetailsContent', () => ({
    DetailsContent: () => <div>DetailsContent</div>,
}));
jest.mock('~/client/toolbar/Toolbar', () => ({
    Toolbar: () => <div>Toolbar</div>,
}));

describe('<DetailsPage>', () => {
    it('renders into the document', () => {
        render(<DetailsPage />);

        expect(screen.getByText('DetailsContent')).toBeInTheDocument();
        expect(screen.getByText('Toolbar')).toBeInTheDocument();
    });
});
