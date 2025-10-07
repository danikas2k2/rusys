import { ProfileActionType, type ProfileAction } from '~/client/state/profile/actions';
import { type Profile } from '~/client/state/profile/types';

export function profile(state: Readonly<Profile> = {}, action: ProfileAction): Readonly<Profile> {
    switch (action.type) {
        case ProfileActionType.SET:
            localStorage.setItem('profile', JSON.stringify(action.profile));
            return action.profile;

        case ProfileActionType.SET_ALLOWED: {
            const newProfile = { ...state, allowed: action.allowed };
            localStorage.setItem('profile', JSON.stringify(newProfile));
            return newProfile;
        }

        case ProfileActionType.RESET:
            localStorage.removeItem('profile');
            return {};

        default:
            return state;
    }
}
