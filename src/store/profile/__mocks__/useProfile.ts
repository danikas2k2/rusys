import { vi } from 'vitest';

import { DEV_MODE_PROFILE } from '~/store/profile/dev';

export const useProfile = vi.fn().mockReturnValue(DEV_MODE_PROFILE);
