import { useQuickFilterContext } from '~/client/app/filters/QuickFilterContext';

export function useQuickFilter(): string {
    return useQuickFilterContext()[0];
}
