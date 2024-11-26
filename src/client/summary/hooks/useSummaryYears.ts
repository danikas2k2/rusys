import { useYears } from '~/state/years/useYears';

export function useSummaryYears() {
    return useYears(3);
}
