import type { Profile } from '~/state/profile/types';

export const DEV_MODE_SUB = 'DEV_MODE';

export const DEV_MODE_EMAIL = 'dev@mo.de';

export const DEV_MODE_PROFILE: Profile = {
    dev: true,
    sub: DEV_MODE_SUB,
    email: DEV_MODE_EMAIL,
    name: 'Dev Mode',
};
