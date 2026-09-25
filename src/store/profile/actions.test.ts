import { ProfileActionType, resetProfileAction, setAllowedAction, setProfileAction } from '~/store/profile/actions';
import type { Profile } from '~/store/profile/types';

describe('setProfileAction', () => {
    it('returns valid action', () => {
        const profile: Profile = {
            name: 'Big Buddy',
            email: 'big.buddy@email.com',
        };

        expect(setProfileAction(profile)).toStrictEqual({
            type: ProfileActionType.SET,
            profile,
        });
    });
});

describe('resetProfileAction', () => {
    it('returns valid action', () => {
        expect(resetProfileAction()).toStrictEqual({
            type: ProfileActionType.RESET,
        });
    });
});

describe('setAllowedAction', () => {
    it('returns valid action', () => {
        expect(setAllowedAction(true)).toStrictEqual({
            type: ProfileActionType.SET_ALLOWED,
            allowed: true,
        });
    });
});
