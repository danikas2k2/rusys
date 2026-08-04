import { render } from '@testing-library/react';

import React from 'react';

import { ExpiryStatusRow } from '~/client/pages/products/ExpiryStatusRow';

describe('<ExpiryStatusRow>', () => {
    it('renders no icon and no data-expires attribute for a valid (undefined) row', () => {
        const { container } = render(
            <ExpiryStatusRow status={undefined}>
                <span>content</span>
            </ExpiryStatusRow>
        );

        expect(container.querySelector('[data-amounts-row]')).not.toHaveAttribute('data-expires');
        expect(container.querySelector('.tabler-icon-clock')).not.toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-calendar-x')).not.toBeInTheDocument();
    });

    it('renders the clock icon and data-expires="soon" for a soon row', () => {
        const { container } = render(
            <ExpiryStatusRow status="soon">
                <span>content</span>
            </ExpiryStatusRow>
        );

        expect(container.querySelector('[data-amounts-row]')).toHaveAttribute('data-expires', 'soon');
        expect(container.querySelector('.tabler-icon-clock')).toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-calendar-x')).not.toBeInTheDocument();
    });

    it('renders the calendar-x icon and data-expires="expired" for an expired row', () => {
        const { container } = render(
            <ExpiryStatusRow status="expired">
                <span>content</span>
            </ExpiryStatusRow>
        );

        expect(container.querySelector('[data-amounts-row]')).toHaveAttribute('data-expires', 'expired');
        expect(container.querySelector('.tabler-icon-calendar-x')).toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-clock')).not.toBeInTheDocument();
    });

    it('renders its children', () => {
        const { getByText } = render(
            <ExpiryStatusRow status="soon">
                <span>hello</span>
            </ExpiryStatusRow>
        );

        expect(getByText('hello')).toBeInTheDocument();
    });
});
