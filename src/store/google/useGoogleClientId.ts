import { useGoogle } from './useGoogle';

export function useGoogleClientId(): string {
    return useGoogle().clientId ?? '';
}
