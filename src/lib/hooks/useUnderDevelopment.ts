import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';
import { useGoogle } from '~/store/google';

export function useUnderDevelopment(): boolean {
    return useGoogle().clientId === DEV_CLIENT_ID || isDevMode();
}
