import { render } from '@testing-library/react';

import React from 'react';

import { MissingOnlyContext } from '~/client/pages/products/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { useHasMissing } from '~/client/state/products/useHasMissing';

jest.mock('~/client/pages/products/ProductsTable', () => ({
    ProductsTable: jest.fn(),
}));
jest.mock('~/client/state/products/useHasMissing', () => ({
    useHasMissing: jest.fn().mockReturnValue(true),
}));

describe('<MissingOnlyEffects>', () => {
    it('removes missing-only state if has no missing items', () => {
        jest.mocked(useHasMissing).mockReturnValue(false);
        const setMissingOnly = jest.fn();
        render(
            <MissingOnlyContext value={[true, setMissingOnly]}>
                <MissingOnlyEffects />
            </MissingOnlyContext>
        );

        expect(setMissingOnly).toHaveBeenCalledWith(false);
    });

    it('does not change falsy missing-only state if has no missing items', () => {
        jest.mocked(useHasMissing).mockReturnValue(false);
        const setMissingOnly = jest.fn();
        render(
            <MissingOnlyContext value={[false, setMissingOnly]}>
                <MissingOnlyEffects />
            </MissingOnlyContext>
        );

        expect(setMissingOnly).not.toHaveBeenCalled();
    });
});
