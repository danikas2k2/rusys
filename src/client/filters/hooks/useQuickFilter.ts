import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';

export function useQuickFilter(): string {
    return useQuickFilterContext()[0];
}
