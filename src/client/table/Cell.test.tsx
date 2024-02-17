import { render, screen } from '@testing-library/react';
import React from 'react';
import { Cell } from './Cell';

describe('Cell', () => {
    it('renders into the document', () => {
        render(<Cell />);
        expect(screen.getByRole('cell')).toBeInTheDocument();
    });

    it('renders with provided role', () => {
        render(<Cell role="columnheader" />);
        expect(screen.getByRole('columnheader')).toBeInTheDocument();
    });

    it('renders with provided className', () => {
        render(<Cell className="test-class" />);
        expect(screen.getByRole('cell')).toHaveClass('test-class');
    });

    it('renders with provided children', () => {
        render(<Cell>Test Content</Cell>);
        expect(screen.getByRole('cell')).toHaveTextContent('Test Content');
    });

    it('renders with other attributes', () => {
        render(<Cell aria-label="test label" data-test="test data" />);
        expect(screen.getByRole('cell')).toHaveAttribute('aria-label', 'test label');
        expect(screen.getByRole('cell')).toHaveAttribute('data-test', 'test data');
    });
});
