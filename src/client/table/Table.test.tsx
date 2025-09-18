import { render, screen } from '@testing-library/react';

import React from 'react';

import { Table } from './Table';

describe('<Table>', () => {
    it('renders into the document', () => {
        render(<Table />);

        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(<Table className="test-class" />);

        expect(screen.getByRole('table')).toHaveClass('test-class');
    });

    it('renders with provided children', () => {
        render(<Table>Test Content</Table>);

        expect(screen.getByRole('rowgroup')).toHaveTextContent('Test Content');
    });

    it('renders with provided header', () => {
        render(<Table header={<div>Test Header</div>} />);

        expect(screen.getAllByRole('rowgroup')[0]).toHaveTextContent('Test Header');
    });

    it('renders with provided footer', () => {
        render(<Table footer={<div>Test Footer</div>} />);

        expect(screen.getAllByRole('rowgroup')[1]).toHaveTextContent('Test Footer');
    });
});
