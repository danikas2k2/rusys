import { useYears } from '~/client/state/years/useYears';

export function useSummaryYears() {
    return useYears(3);
}
