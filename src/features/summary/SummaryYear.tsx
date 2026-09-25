import React from 'react';

interface SummaryYearProps {
    year: number;
}

export function SummaryYear({ year }: SummaryYearProps): React.JSX.Element {
    return (
        <span data-summary-year>
            <sup>{year}</sup>/<sub>{year + 1}</sub>
        </span>
    );
}
