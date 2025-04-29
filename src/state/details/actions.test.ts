import { getDetailsFixture } from '@tests/fixtures';
import { type Details } from '~/common/types';
import { DetailsActionType, setDetailsAction } from '~/state/details/actions';

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
