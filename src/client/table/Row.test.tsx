import { render, screen } from '@testing-library/react';
import React from 'react';
import { Row } from './Row';

describe('Row', () => {
    it('renders into the document', () => {
        render(<Row />);
        expect(screen.getByRole('row')).toBeInTheDocument();
    });

    it('renders with provided role', () => {
        render(<Row role="rowgroup" />);
        expect(screen.getByRole('rowgroup')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(<Row className="test-class" />);
        expect(screen.getByRole('row')).toHaveClass('test-class');
    });

    it('renders with provided children', () => {
        render(<Row>Test Content</Row>);
        expect(screen.getByRole('row')).toHaveTextContent('Test Content');
    });

    it('renders with other attributes', () => {
        render(<Row aria-label="test label" data-test="test data" />);
        expect(screen.getByRole('row')).toHaveAttribute('aria-label', 'test label');
        expect(screen.getByRole('row')).toHaveAttribute('data-test', 'test data');
    });
});
