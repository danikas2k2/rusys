import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('<Loader>', () => {
    it('renders to the document', () => {
        render(<Loader />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
