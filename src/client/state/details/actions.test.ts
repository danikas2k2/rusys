import { getDetailsFixture } from '@tests/fixtures';

import { DetailsActionType, setDetailsAction } from '~/client/state/details/actions';
import { type Details } from '~/types/data';

describe('setDetailsAction', () => {
    it('returns valid action', () => {
        const details = getDetailsFixture();

        expect(setDetailsAction(details)).toStrictEqual({ type: DetailsActionType.SET, details });
    });

    it('returns valid action for empty set', () => {
        const details: Details[] = [];

        expect(setDetailsAction(details)).toStrictEqual({ type: DetailsActionType.SET, details });
    });
});
