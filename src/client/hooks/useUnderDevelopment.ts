import { useGoogle } from '~/client/state/google/useGoogle';
import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';

export function useUnderDevelopment(): boolean {
    return useGoogle().clientId === DEV_CLIENT_ID || isDevMode();
}
