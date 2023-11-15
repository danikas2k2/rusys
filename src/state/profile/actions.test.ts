import { ProfileActionType, resetProfileAction, setAllowedAction, setProfileAction } from '~/state/profile/actions';
import { type Profile } from '~/state/profile/types';

describe('setProfileAction', () => {
    it('returns valid action', () => {
        const profile: Profile = {
            name: 'Big Buddy',
            email: 'big.buddy@email.com',
        };
        expect(setProfileAction(profile)).toEqual({
            type: ProfileActionType.SET,
            profile,
        });
    });
});

describe('resetProfileAction', () => {
    it('returns valid action', () => {
        expect(resetProfileAction()).toEqual({
            type: ProfileActionType.RESET,
        });
    });
});

describe('setAllowedAction', () => {
    it('returns valid action', () => {
        expect(setAllowedAction(true)).toEqual({
            type: ProfileActionType.SET_ALLOWED,
            allowed: true,
        });
    });
});
