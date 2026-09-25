import { getVariantsFixture } from '@tests/fixtures';

import type { Variant } from '@rusys/common/data';

import { setVariantsAction, VariantsActionType } from '~/store/variants/actions';

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
