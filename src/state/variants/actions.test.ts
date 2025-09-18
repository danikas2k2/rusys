import { getVariantsFixture } from '@tests/fixtures';

import { setVariantsAction, VariantsActionType } from '~/state/variants/actions';
import { type Variant } from '~/types/data';

describe('setVariantsAction', () => {
    it('returns valid action', () => {
        const variants = getVariantsFixture();

        expect(setVariantsAction(variants)).toStrictEqual({ type: VariantsActionType.SET, variants });
    });

    it('returns valid action for empty set', () => {
        const variants: Variant[] = [];

        expect(setVariantsAction(variants)).toStrictEqual({ type: VariantsActionType.SET, variants });
    });
});
