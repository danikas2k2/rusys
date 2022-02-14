import { Profile } from '~/store/profile.types';

export enum ProfileActionType {
    SET = 'profile.set',
    RESET = 'profile.reset',
}

export type ProfileAction =
    | {
          type: ProfileActionType.SET;
          profile: Profile;
      }
    | {
          type: ProfileActionType.RESET;
      };

export const setProfileAction = (profile: Profile): ProfileAction => ({ type: ProfileActionType.SET, profile });

export const resetProfileAction = (): ProfileAction => ({ type: ProfileActionType.RESET });
