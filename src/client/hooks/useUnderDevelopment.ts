import { DEV_CLIENT_ID, isDevMode } from '@rusys/common/utils/dev';

import { useGoogle } from '~/client/state/google/useGoogle';

export function useUnderDevelopment(): boolean {
    return useGoogle().clientId === DEV_CLIENT_ID || isDevMode();
}
