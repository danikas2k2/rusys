import { render, screen } from '@testing-library/react';

import React from 'react';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { useAmountView } from '~/client/common/AmountViewContext';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';
import { useVariantsByGroup } from '~/client/state/variants/useVariantsByGroup';

vi.mock(import('~/client/state/variants/useGroupVariantComparator'), () => ({
    useGroupVariantComparator: vi.fn().mockReturnValue(() => 0),
}));
vi.mock(import('~/client/common/AmountSuffix'), () => ({
    AmountSuffix: vi.fn().mockReturnValue(null),
}));
vi.mock(import('~/client/common/AmountViewContext'), () => ({
    useAmountView: vi.fn().mockReturnValue(['detailed', vi.fn()]),
}));
vi.mock(import('~/client/state/variants/useVariantsByGroup'), () => ({
    useVariantsByGroup: vi.fn().mockReturnValue([]),
}));

describe('<ProductAmounts>', () => {
    const group = 'Daržovės';
    const amounts = [
        { variant: 'p', amount: 2 },
        { variant: 'd', amount: 1 },
    ];

    afterEach(() => vi.clearAllMocks());

    it('renders with group and amounts', () => {
        render(<ProductAmounts group={group} amounts={amounts} />);

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();

        expect(AmountSuffix).toHaveBeenCalledTimes(2);
        expect(AmountSuffix).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                group,
                variant: 'p',
            }),
            undefined
        );
        expect(AmountSuffix).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                group,
                variant: 'd',
            }),
            undefined
        );
    });

    it('renders empty when amounts is empty array', () => {
        const { container } = render(<ProductAmounts group={group} amounts={[]} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders empty when amounts is undefined', () => {
        const { container } = render(<ProductAmounts group={group} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('sorts amounts by variant using comparator', () => {
        const mockComparator = vi.fn(() => 0);
        vi.mocked(useGroupVariantComparator).mockReturnValue(mockComparator);

        render(<ProductAmounts group={group} amounts={amounts} />);

        expect(mockComparator).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });

    describe('type prop', () => {
        it('defaults to common and sets data-type="common" on the wrapper span', () => {
            const { container } = render(<ProductAmounts group={group} amounts={amounts} />);

            expect(container.querySelector('[data-type]')).toHaveAttribute('data-type', 'common');
        });

        it('sets data-type="consumed" on the wrapper span', () => {
            const { container } = render(<ProductAmounts group={group} amounts={amounts} type="consumed" />);

            expect(container.querySelector('[data-type]')).toHaveAttribute('data-type', 'consumed');
        });

        it('sets data-type="recycled" on the wrapper span', () => {
            const { container } = render(<ProductAmounts group={group} amounts={amounts} type="recycled" />);

            expect(container.querySelector('[data-type]')).toHaveAttribute('data-type', 'recycled');
        });
    });

    describe('suspicious amounts', () => {
        it('sets data-suspicious attribute on the amount span', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3, suspicious: true }]} />
            );

            expect(container.querySelector('[data-suspicious]')).toBeInTheDocument();
        });

        it('does not set data-suspicious attribute when suspicious is false', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3, suspicious: false }]} />
            );

            expect(container.querySelector('[data-suspicious]')).not.toBeInTheDocument();
        });

        it('does not set data-suspicious attribute when suspicious is absent', () => {
            const { container } = render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

            expect(container.querySelector('[data-suspicious]')).not.toBeInTheDocument();
        });

        it('renders IconAlertTriangle for a suspicious amount', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3, suspicious: true }]} />
            );

            expect(container.querySelector('.tabler-icon-alert-triangle')).toBeInTheDocument();
        });

        it('does not render IconAlertTriangle for a non-suspicious amount', () => {
            const { container } = render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

            expect(container.querySelector('.tabler-icon-alert-triangle')).not.toBeInTheDocument();
        });

        it('does not render ~ prefix for suspicious amounts', () => {
            render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 5, suspicious: true }]} />);

            // amount text rendered without tilde prefix
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.queryByText('~5')).not.toBeInTheDocument();
        });

        it('sorts suspicious amount after normal amount for the same variant', () => {
            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, suspicious: true },
                        { variant: 'p', amount: 2 },
                    ]}
                />
            );

            const spans = container.querySelectorAll('[data-value]');

            expect(spans).toHaveLength(2);
            expect(spans[0]).toHaveTextContent('2');
            expect(spans[1]).toHaveTextContent('1');
        });

        it('calls AmountSuffix with correct group and variant for suspicious entries', () => {
            render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3, suspicious: true }]} />);

            expect(AmountSuffix).toHaveBeenCalledWith(expect.objectContaining({ group, variant: 'p' }), undefined);
        });
    });

    describe('home amounts', () => {
        it('sets data-home attribute on the amount span', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 4, home: true }]} />
            );

            expect(container.querySelector('[data-home]')).toBeInTheDocument();
        });

        it('does not set data-home attribute when home is false', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 4, home: false }]} />
            );

            expect(container.querySelector('[data-home]')).not.toBeInTheDocument();
        });

        it('does not set data-home attribute when home is absent', () => {
            const { container } = render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 4 }]} />);

            expect(container.querySelector('[data-home]')).not.toBeInTheDocument();
        });

        it('renders tilde icon prefix for home amounts', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 7, home: true }]} />
            );

            expect(container.querySelector('.tabler-icon-tilde')).toBeInTheDocument();
            expect(screen.getByText('7')).toBeInTheDocument();
        });

        it('does not render ~ prefix for non-home amounts', () => {
            render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 7 }]} />);

            expect(screen.queryByText('~7')).not.toBeInTheDocument();
            expect(screen.getByText('7')).toBeInTheDocument();
        });

        it('renders IconHome for home amounts', () => {
            const { container } = render(
                <ProductAmounts group={group} amounts={[{ variant: 'p', amount: 4, home: true }]} />
            );

            expect(container.querySelector('.tabler-icon-home')).toBeInTheDocument();
        });

        it('does not render IconHome for non-home amounts', () => {
            const { container } = render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 4 }]} />);

            expect(container.querySelector('.tabler-icon-home')).not.toBeInTheDocument();
        });

        it('sorts home amount after normal amount for the same variant', () => {
            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 1, home: true },
                        { variant: 'p', amount: 2 },
                    ]}
                />
            );

            const spans = container.querySelectorAll('[data-value]');

            expect(spans).toHaveLength(2);
            expect(spans[0]).toHaveTextContent('2');
            expect(spans[1]).toHaveTextContent('1');
            expect(spans[1].querySelector('.tabler-icon-tilde')).toBeInTheDocument();
        });

        it('calls AmountSuffix with correct group and variant for home entries', () => {
            render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 4, home: true }]} />);

            expect(AmountSuffix).toHaveBeenCalledWith(expect.objectContaining({ group, variant: 'p' }), undefined);
        });
    });

    describe('mixed: normal, suspicious, and home for the same variant', () => {
        const mixedAmounts = [
            { variant: 'p', amount: 1, suspicious: true },
            { variant: 'p', amount: 2, home: true },
            { variant: 'p', amount: 3 },
        ];

        it('renders all three amount spans', () => {
            const { container } = render(<ProductAmounts group={group} amounts={mixedAmounts} />);

            expect(container.querySelectorAll('[data-value]')).toHaveLength(3);
        });

        it('renders the normal amount first in DOM order', () => {
            const { container } = render(<ProductAmounts group={group} amounts={mixedAmounts} />);

            const spans = container.querySelectorAll('[data-value]');

            expect(spans[0]).toHaveTextContent('3');
        });

        it('the normal span has neither data-suspicious nor data-home attribute', () => {
            const { container } = render(<ProductAmounts group={group} amounts={mixedAmounts} />);

            const normalSpan = container.querySelector('[data-value]:not([data-suspicious]):not([data-home])');

            expect(normalSpan).toBeInTheDocument();
            expect(normalSpan).toHaveTextContent('3');
        });

        it('renders both IconAlertTriangle and IconHome', () => {
            const { container } = render(<ProductAmounts group={group} amounts={mixedAmounts} />);

            expect(container.querySelector('.tabler-icon-alert-triangle')).toBeInTheDocument();
            expect(container.querySelector('.tabler-icon-home')).toBeInTheDocument();
        });

        it('calls AmountSuffix for all three entries', () => {
            render(<ProductAmounts group={group} amounts={mixedAmounts} />);

            expect(AmountSuffix).toHaveBeenCalledTimes(3);

            vi.mocked(AmountSuffix).mock.calls.forEach(([props]: [Record<string, unknown>]) => {
                expect(props).toMatchObject({ group, variant: 'p' });
            });
        });
    });

    describe('sort stability: primary sort by variant overrides secondary suspicious/home sort', () => {
        it('suspicious entry for an earlier variant sorts before normal entry for a later variant', () => {
            vi.mocked(useGroupVariantComparator).mockReturnValue((a: string, b: string) => a.localeCompare(b));

            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'b', amount: 10 },
                        { variant: 'a', amount: 5, suspicious: true },
                    ]}
                />
            );

            const spans = container.querySelectorAll('[data-value]');

            expect(spans).toHaveLength(2);
            // 'a' < 'b' — suspicious 'a' (5) must appear before normal 'b' (10)
            expect(spans[0]).toHaveTextContent('5');
            expect(spans[1]).toHaveTextContent('10');
        });

        it('home entry for an earlier variant sorts before normal entry for a later variant', () => {
            vi.mocked(useGroupVariantComparator).mockReturnValue((a: string, b: string) => a.localeCompare(b));

            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'b', amount: 10 },
                        { variant: 'a', amount: 5, home: true },
                    ]}
                />
            );

            const spans = container.querySelectorAll('[data-value]');

            expect(spans).toHaveLength(2);
            // 'a' < 'b' — home 'a' (~5) must appear before normal 'b' (10)
            expect(spans[0]).toHaveTextContent('5');
            expect(spans[0].querySelector('.tabler-icon-tilde')).toBeInTheDocument();
            expect(spans[1]).toHaveTextContent('10');
        });

        it('sorts multiple variants with mixed flags in variant-first order', () => {
            vi.mocked(useGroupVariantComparator).mockReturnValue((a: string, b: string) => a.localeCompare(b));

            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'c', amount: 30 },
                        { variant: 'a', amount: 10, suspicious: true },
                        { variant: 'a', amount: 20 },
                        { variant: 'b', amount: 15 },
                    ]}
                />
            );

            const spans = container.querySelectorAll('[data-value]');

            expect(spans).toHaveLength(4);
            // Expected order: a-normal (20), a-suspicious (10), b-normal (15), c-normal (30)
            expect(spans[0]).toHaveTextContent('20');
            expect(spans[1]).toHaveTextContent('10');
            expect(spans[2]).toHaveTextContent('15');
            expect(spans[3]).toHaveTextContent('30');
        });
    });

    describe('useGroupVariantComparator integration', () => {
        it('calls useGroupVariantComparator with the correct group', () => {
            render(<ProductAmounts group={group} amounts={amounts} />);

            expect(useGroupVariantComparator).toHaveBeenCalledWith(group);
        });

        it('passes variant strings from amounts to the returned comparator', () => {
            const mockComparator = vi.fn(() => 0);
            vi.mocked(useGroupVariantComparator).mockReturnValue(mockComparator);

            render(<ProductAmounts group={group} amounts={amounts} />);

            // sort() may call comparator with arguments in either order
            expect(mockComparator).toHaveBeenCalledWith(expect.any(String), expect.any(String));

            const allArgs = mockComparator.mock.calls.flat();

            expect(allArgs).toContain('p');
            expect(allArgs).toContain('d');
        });
    });

    describe('total view', () => {
        beforeEach(() => {
            vi.mocked(useAmountView).mockReturnValue(['total', vi.fn()]);
        });

        it('sums variants sharing a units family into a single value', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([
                { group, variant: 'p', order: 0, units: 'ml', count: 500 },
                { group, variant: 'd', order: 1, units: 'l', count: 1 },
            ]);

            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 5 },
                        { variant: 'd', amount: 2 },
                    ]}
                />
            );

            expect(container.querySelector('[data-total="volume"]')).toHaveTextContent('4½l');
            expect(container.querySelector('[data-total="volume"] sub')).toHaveTextContent('l');
        });

        it('renders variants without units individually, like the detailed view', () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([]);

            render(<ProductAmounts group={group} amounts={[{ variant: 'p', amount: 3 }]} />);

            expect(screen.getByText('3')).toBeInTheDocument();
            expect(AmountSuffix).toHaveBeenCalledWith(expect.objectContaining({ group, variant: 'p' }), undefined);
        });

        it("renders separate totals for 'vnt' units variants alongside volume totals", () => {
            vi.mocked(useVariantsByGroup).mockReturnValue([
                { group, variant: 'p', order: 0, units: 'ml', count: 500 },
                { group, variant: 'd', order: 1, units: 'vnt' },
            ]);

            const { container } = render(
                <ProductAmounts
                    group={group}
                    amounts={[
                        { variant: 'p', amount: 2 },
                        { variant: 'd', amount: 4 },
                    ]}
                />
            );

            expect(container.querySelector('[data-total="volume"]')).toHaveTextContent('1l');
            expect(container.querySelector('[data-total="count"]')).toHaveTextContent('4');
            expect(container.querySelector('[data-total="count"] sub')).not.toBeInTheDocument();
        });
    });
});
