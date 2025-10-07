import { useGroupFilterContext } from '~/client/app/filters/GroupFilterContext';

export function useGroupFilter(): string {
    return useGroupFilterContext()[0];
}
