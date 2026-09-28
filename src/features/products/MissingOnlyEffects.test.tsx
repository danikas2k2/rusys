import { render } from '@testing-library/react';

import React from 'react';

import { MissingOnlyContext } from '~/features/products/MissingOnlyContext';
import { MissingOnlyEffects } from '~/features/products/MissingOnlyEffects';
import { useHasMissing } from '~/store/products/useHasMissing';

vi.mock(import('~/store/products/useHasMissing'), () => ({
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
