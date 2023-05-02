import { useDispatch, useSelector } from 'react-redux';
import { type BaseState } from '~/store/base/types';
import { setProfileAction } from '~/store/profile/actions';
import { type Profile } from '~/store/profile/types';

export default function useProfile(): Profile {
    let profile = useSelector((state: BaseState) => state.profile);
    if (!profile.sub) {
        profile = JSON.parse(localStorage.getItem('profile') ?? '{}') ?? {};
        if (profile.sub) {
            const dispatch = useDispatch();
            dispatch(setProfileAction(profile));
        }
    }
    return profile;
}
