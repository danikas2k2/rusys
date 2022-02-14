import { ProfileAction, ProfileActionType } from '~/store/profile.actions';
import { Profile } from '~/store/profile.types';

export default function profile(profile: Profile = {}, action: ProfileAction) {
    switch (action.type) {
        case ProfileActionType.SET:
            return action.profile;

        case ProfileActionType.RESET:
            return {};

        default:
            return profile;
    }
}
