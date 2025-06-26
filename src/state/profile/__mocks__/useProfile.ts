import { DEV_MODE_PROFILE } from '~/state/profile/dev';

export const useProfile = jest.fn().mockReturnValue(DEV_MODE_PROFILE);
