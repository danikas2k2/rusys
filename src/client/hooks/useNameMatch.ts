import { compareGroups } from '~/client/utils/compareGroups';
import { compareNames } from '~/client/utils/compareNames';
import { useDetails } from '~/state/details/useDetails';

export const useNameMatch = (group: string, name: string): boolean =>
    !!useDetails()?.some((d) => !compareGroups(group, d.group) && !compareNames(name, d.name));
