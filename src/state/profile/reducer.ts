import { type ProfileAction, ProfileActionType } from '~/state/profile/actions';
import { type Profile } from '~/state/profile/types';

export default function profile(state: Profile = {}, action: ProfileAction): Profile {
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
