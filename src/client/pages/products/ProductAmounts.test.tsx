import { render, screen } from '@testing-library/react';

import React from 'react';

import { AmountSuffix } from '~/client/common/AmountSuffix';
import { ProductAmounts } from '~/client/pages/products/ProductAmounts';
import { useGroupVariantComparator } from '~/client/state/variants/useGroupVariantComparator';

jest.mock('~/client/state/variants/useGroupVariantComparator', () => ({
    useGroupVariantComparator: jest.fn().mockReturnValue(() => 0),
}));
jest.mock('~/client/common/AmountSuffix', () => ({
    AmountSuffix: jest.fn().mockReturnValue(null),
}));

describe('<ProductAmounts>', () => {
    const group = 'Daržovės';
    const amounts = [
        { variant: 'p', amount: 2 },
        { variant: 'd', amount: 1 },
    ];

    afterEach(() => jest.clearAllMocks());

    it('renders with group and amounts', () => {
        render(<ProductAmounts group={group} amounts={amounts} />);

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();

        expect(AmountSuffix)
            .toHaveBeenCalledTimes(2)
            .toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    group,
                    variant: 'p',
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
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
        const mockComparator = jest.fn(() => 0);
        jest.mocked(useGroupVariantComparator).mockReturnValue(mockComparator);

        render(<ProductAmounts group={group} amounts={amounts} />);

        expect(mockComparator).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });
});
