import { render, screen } from '@testing-library/react';

import React from 'react';

import { DetailsPage } from '~/client/app/details/DetailsPage';

jest.mock('~/client/app/details/DetailsContent', () => ({
    DetailsContent: () => <div>DetailsContent</div>,
}));
jest.mock('~/client/app/toolbar/Toolbar', () => ({
    Toolbar: () => <div>Toolbar</div>,
}));

describe('<DetailsPage>', () => {
    it('renders into the document', () => {
        render(<DetailsPage />);

        expect(screen.getByText('DetailsContent')).toBeInTheDocument();
        expect(screen.getByText('Toolbar')).toBeInTheDocument();
    });
});
