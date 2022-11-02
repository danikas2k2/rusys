import type { ProfileAction } from '~/store/profile.actions';
import { ProfileActionType } from '~/store/profile.actions';
import type { Profile } from '~/store/profile.types';

export default function profile(state: Profile = {}, action: ProfileAction): Profile {
    switch (action.type) {
        case ProfileActionType.SET:
            return action.profile;

        case ProfileActionType.SET_ALLOWED:
            return { ...state, allowed: action.allowed };

        case ProfileActionType.RESET:
            return {};

        default:
            return state;
    }
}
