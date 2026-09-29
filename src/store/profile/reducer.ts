import { ProfileActionType, type ProfileAction } from '~/store/profile/actions';
import type { Profile } from '~/store/profile/types';

export function profile(state: Readonly<Profile> = {}, action: ProfileAction): Readonly<Profile> {
    switch (action.type) {
        case ProfileActionType.SET:
            return action.profile;

        case ProfileActionType.SET_ALLOWED: {
            const newProfile = { ...state, allowed: action.allowed };
            return newProfile;
        }

        case ProfileActionType.RESET:
            return {};

        default:
            return state;
    }
}
