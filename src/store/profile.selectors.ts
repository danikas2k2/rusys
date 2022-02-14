import { useSelector } from 'react-redux';
import { BaseState } from '~/store/base.types';
import { Profile } from '~/store/profile.types';

export const useProfile = (): Profile => useSelector((state: BaseState) => state.profile);
