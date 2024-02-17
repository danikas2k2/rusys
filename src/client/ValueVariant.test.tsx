import { render, screen } from '@testing-library/react';
import React from 'react';
import { ValueVariant } from '~/client/ValueVariant';

describe('ValueVariant', () => {
    it('renders short format when format prop is not provided', () => {
        render(<ValueVariant variant="1.5" />);
        expect(screen.getByText('1½')).toBeInTheDocument();
    });

    it('renders short format when format prop is "short"', () => {
        render(<ValueVariant variant="1.5" format="short" />);
        expect(screen.getByText('1½')).toBeInTheDocument();
    });

    it('renders long format when format prop is "long"', () => {
        render(<ValueVariant variant="1.5" format="long" />);
        expect(screen.getByText('1.5')).toBeInTheDocument();
        expect(screen.getByText('l.')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found', () => {
        render(<ValueVariant variant="unknown" />);
        expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found and format prop is "long"', () => {
        render(<ValueVariant variant="unknown" format="long" />);
        expect(screen.getByText('unknown')).toBeInTheDocument();
    });
});
