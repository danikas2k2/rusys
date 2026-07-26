import { useGroups } from '~/client/state/groups/useGroups';

export const useHasReviewGroups = (): boolean => useGroups().some((g) => g.review);
