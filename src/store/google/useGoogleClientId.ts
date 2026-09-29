import { useGoogle } from '~/store/google/useGoogle';

export function useGoogleClientId(): string {
    return useGoogle().clientId ?? '';
}
