import { useGroups } from '~/store/groups/useGroups';

export const useHasReviewGroups = (): boolean => useGroups().some((g) => g.review);
