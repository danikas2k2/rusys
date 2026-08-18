import { render, screen } from '@testing-library/react';

import React from 'react';

import { VariantValueSpans } from '~/client/common/VariantValueSpans';

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn().mockReturnValue(() => 0),
}));
vi.mock(import('~/client/common/AmountSuffix'), () => ({
    AmountSuffix: vi.fn().mockReturnValue(null),
}));

describe('<VariantValueSpans>', () => {
    const group = 'Daržovės';

    afterEach(() => vi.clearAllMocks());

    it('renders one value span per variant', () => {
        const { container } = render(
            <VariantValueSpans
                group={group}
                amounts={[
                    { variant: 'p', amount: 2 },
                    { variant: 'd', amount: 1 },
                ]}
            />
        );

        expect(container.querySelectorAll('[data-value]')).toHaveLength(2);
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('merges differently-dated entries of the same variant into one value', () => {
        const { container } = render(
            <VariantValueSpans
                group={group}
                amounts={[
                    { variant: 'p', amount: 6 },
                    { variant: 'p', amount: 1, expiresAt: 100 },
                    { variant: 'p', amount: 2, expiresAt: 200 },
                ]}
            />
        );

        const values = container.querySelectorAll('[data-value]');

        expect(values).toHaveLength(1);
        expect(values[0]).toHaveTextContent('9');
    });

    it('sets data-suspicious on a suspicious entry and renders the warning icon', () => {
        const { container } = render(
            <VariantValueSpans group={group} amounts={[{ variant: 'p', amount: 3, suspicious: true }]} />
        );

        expect(container.querySelector('[data-suspicious]')).toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-alert-triangle')).toBeInTheDocument();
    });

    it('sets data-home on a home entry and renders the home + tilde icons', () => {
        const { container } = render(
            <VariantValueSpans group={group} amounts={[{ variant: 'p', amount: 4, home: true }]} />
        );

        expect(container.querySelector('[data-home]')).toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-home')).toBeInTheDocument();
        expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
    });

    it('keeps suspicious and home entries of the same variant as separate values', () => {
        const { container } = render(
            <VariantValueSpans
                group={group}
                amounts={[
                    { variant: 'p', amount: 1 },
                    { variant: 'p', amount: 2, suspicious: true },
                    { variant: 'p', amount: 3, home: true },
                ]}
            />
        );

        expect(container.querySelectorAll('[data-value]')).toHaveLength(3);
    });

    it('sorts the plain entry before suspicious/home entries of the same variant', () => {
        const { container } = render(
            <VariantValueSpans
                group={group}
                amounts={[
                    { variant: 'p', amount: 1, suspicious: true },
                    { variant: 'p', amount: 2 },
                ]}
            />
        );

        const values = container.querySelectorAll('[data-value]');

        expect(values[0]).toHaveTextContent('2');
        expect(values[1]).toHaveTextContent('1');
    });
});
