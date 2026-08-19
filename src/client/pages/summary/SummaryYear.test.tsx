import { render, screen } from '@testing-library/react';

import React from 'react';

import { SummaryYear } from '~/client/pages/summary/SummaryYear';

describe('<SummaryYear>', () => {
    it('renders the accounting-year range', () => {
        render(<SummaryYear year={2025} />);

        const year = screen.getByText('2025', { selector: 'sup' }).parentElement;

        expect(year).toHaveAttribute('data-summary-year');
        expect(year).toHaveTextContent('2025/2026');
    });
});
