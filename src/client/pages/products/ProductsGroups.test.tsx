import { render } from '@testing-library/react';
import { getGroupsFixture, getProductsFixture } from '@tests/fixtures';
import { MockThemeRedux } from '@tests/MockThemeRedux';

import React from 'react';

import { ProductsGroups } from '~/client/pages/products/ProductsGroups';
import { GroupProducts } from '~/client/pages/products/GroupProducts';

jest.mock('~/client/pages/products/GroupProducts', () => ({
    GroupProducts: jest.fn().mockReturnValue(null),
}));

describe('<ProductsGroups>', () => {
    const groups = getGroupsFixture();
    const products = getProductsFixture();
    const state = { years: [23, 22, 21], groups };

    afterEach(() => jest.clearAllMocks());

    it('renders GroupProducts for every group', () => {
        render(
            <MockThemeRedux state={state}>
                <ProductsGroups groups={groups} products={products} />
            </MockThemeRedux>
        );

        expect(GroupProducts).toHaveBeenCalledTimes(groups.length);
        expect(GroupProducts).toHaveBeenCalledWith({ group: groups[0], products }, undefined);
        expect(GroupProducts).toHaveBeenCalledWith({ group: groups[1], products }, undefined);
    });
});

