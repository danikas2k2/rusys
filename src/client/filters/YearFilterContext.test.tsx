import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';

import React from 'react';

import { MockRoute } from '~/tests/MockRoute';
import { getCurrentYear, useYearFilter, YearFilterWrapper } from './YearFilterContext';

function TestComponent() {
    const [year, setYear] = useYearFilter();

    return (
        <div>
            <span aria-label="filter-value">{year}</span>
            <button onClick={() => setYear(2021)}>Set Year</button>
        </div>
    );
}

describe('<YearFilterWrapper>', () => {
    it('provides current year as default initial value', () => {
        render(
            <MockRoute>
                <YearFilterWrapper>
                    <TestComponent />
                </YearFilterWrapper>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent(`${getCurrentYear()}`);
    });

    it('provides custom initial value', () => {
        render(
            <MockRoute>
                <YearFilterWrapper initialState={2018}>
                    <TestComponent />
                </YearFilterWrapper>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('2018');
    });

    it('reads initial year from search params', () => {
        render(
            <MockRoute initialEntries={['/?y=2019']}>
                <YearFilterWrapper>
                    <TestComponent />
                </YearFilterWrapper>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('2019');
    });

    it('uses custom param name when provided', () => {
        render(
            <MockRoute initialEntries={['/?year=2017']}>
                <YearFilterWrapper>
                    <TestComponent />
                </YearFilterWrapper>
            </MockRoute>
        );

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('2017');
    });

    it('syncs search params on update', async () => {
        render(
            <MockRoute>
                <YearFilterWrapper>
                    <TestComponent />
                </YearFilterWrapper>
            </MockRoute>
        );

        await user.click(screen.getByRole('button', { name: 'Set Year' }));

        expect(screen.getByRole('generic', { name: 'filter-value' })).toHaveTextContent('2021');
    });
});
