import { render } from '@testing-library/react';

import React from 'react';

import { MissingOnlyContext } from '~/client/pages/products/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/products/MissingOnlyEffects';
import { useHasMissing } from '~/client/state/products/useHasMissing';

vi.mock(import('~/client/state/products/useHasMissing'), () => ({
    useHasMissing: vi.fn().mockReturnValue(true),
}));

describe('<MissingOnlyEffects>', () => {
    it('removes missing-only state if has no missing items', () => {
        vi.mocked(useHasMissing).mockReturnValue(false);
        const setMissingOnly = vi.fn();
        render(
            <MissingOnlyContext value={[true, setMissingOnly]}>
                <MissingOnlyEffects />
            </MissingOnlyContext>
        );

        expect(setMissingOnly).toHaveBeenCalledWith(false);
    });

    it('does not change falsy missing-only state if has no missing items', () => {
        vi.mocked(useHasMissing).mockReturnValue(false);
        const setMissingOnly = vi.fn();
        render(
            <MissingOnlyContext value={[false, setMissingOnly]}>
                <MissingOnlyEffects />
            </MissingOnlyContext>
        );

        expect(setMissingOnly).not.toHaveBeenCalled();
    });
});
