import { useSelector } from 'react-redux';
import type { BaseState } from '~/store/base.types';
import type { Profile } from '~/store/profile.types';

export const useProfile = (): Profile => useSelector((state: BaseState) => state.profile);
