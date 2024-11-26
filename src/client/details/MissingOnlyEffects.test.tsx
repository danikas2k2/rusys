import { render } from '@testing-library/react';
import React from 'react';

import { MissingOnlyContext } from '~/client/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/details/MissingOnlyEffects';
import { useHasMissing } from '~/state/details/useHasMissing';

jest.mock('~/client/details/DetailsTable', () => ({
    DetailsTable: jest.fn(),
}));
jest.mock('~/state/details/useHasMissing', () => ({
    useHasMissing: jest.fn().mockReturnValue(true),
}));

describe('MissingOnlyEffects', () => {
    it('removes missing-only state if has no missing items', () => {
        (useHasMissing as jest.Mock).mockReturnValue(false);
        const setMissingOnly = jest.fn();
        render(
            <MissingOnlyContext.Provider value={[true, setMissingOnly]}>
                <MissingOnlyEffects />
            </MissingOnlyContext.Provider>
        );
        expect(setMissingOnly).toHaveBeenCalledWith(false);
    });

    it('does not change falsy missing-only state if has no missing items', () => {
        (useHasMissing as jest.Mock).mockReturnValue(false);
        const setMissingOnly = jest.fn();
        render(
            <MissingOnlyContext.Provider value={[false, setMissingOnly]}>
                <MissingOnlyEffects />
            </MissingOnlyContext.Provider>
        );
        expect(setMissingOnly).not.toHaveBeenCalled();
    });
});
