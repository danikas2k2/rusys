import { type Details } from '~/common/types';
import { DetailsActionType, setDetailsAction } from '~/state/details/actions';
import { getDetailsFixture } from '~/tests/fixtures';

describe('setDetailsAction', () => {
    it('returns valid action', () => {
        const details = getDetailsFixture();
        expect(setDetailsAction(details)).toEqual({ type: DetailsActionType.SET, details });
    });

    it('returns valid action for empty set', () => {
        const details: Details[] = [];
        expect(setDetailsAction(details)).toEqual({ type: DetailsActionType.SET, details });
    });
});
