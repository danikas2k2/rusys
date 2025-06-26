import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValueSuffix } from '~/client/common/ValueSuffix';
import { ValueAmounts } from '~/client/details/ValueAmounts';

jest.mock('~/state/variants/useGroupVariantComparator', () => ({
    useGroupVariantComparator: jest.fn().mockReturnValue(() => 0),
}));
jest.mock('~/client/common/ValueSuffix', () => ({
    ValueSuffix: jest.fn().mockReturnValue(null),
}));

describe('<ValueAmounts>', () => {
    const group = 'Daržovės';
    const amounts = [
        { variant: 'p', amount: 2 },
        { variant: 'd', amount: 1 },
    ];

    afterEach(() => jest.clearAllMocks());

    it('renders details groups with groups and details', () => {
        render(<ValueAmounts group={group} amounts={amounts} />);

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();

        expect(ValueSuffix)
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
});
