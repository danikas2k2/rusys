import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

export function useSummaryLoader(): () => Promise<void> {
    const request = useUpdatingApiRequest();
    return () => request('/summary');
}
