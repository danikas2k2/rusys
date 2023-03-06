import type { Profile } from '~/store/profile/types';

export const enum ProfileActionType {
    SET = 'profile.set',
    SET_ALLOWED = 'profile.allowed',
    RESET = 'profile.reset',
}

export type ProfileAction =
    | {
          type: ProfileActionType.SET;
          profile: Profile;
      }
    | {
          type: ProfileActionType.SET_ALLOWED;
          allowed: boolean;
      }
    | {
          type: ProfileActionType.RESET;
      };

export const setProfileAction = (profile: Profile): ProfileAction => ({ type: ProfileActionType.SET, profile });

export const setAllowedAction = (allowed: boolean): ProfileAction => ({ type: ProfileActionType.SET_ALLOWED, allowed });

export const resetProfileAction = (): ProfileAction => ({ type: ProfileActionType.RESET });
