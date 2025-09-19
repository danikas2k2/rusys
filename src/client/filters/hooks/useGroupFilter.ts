import { useGroupFilterContext } from '~/client/filters/GroupFilterContext';

export function useGroupFilter(): string {
    return useGroupFilterContext()[0];
}
