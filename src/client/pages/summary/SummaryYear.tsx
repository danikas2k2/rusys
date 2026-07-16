import React from 'react';

interface SummaryYearProps {
    year: number;
}

export function SummaryYear({ year }: SummaryYearProps): React.JSX.Element {
    return (
        <>
            <sup>{year}</sup>/<sub>{year + 1}</sub>
        </>
    );
}
