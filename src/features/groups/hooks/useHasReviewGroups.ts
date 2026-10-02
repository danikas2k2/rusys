import { useGroups } from '~/store/groups';

export const useHasReviewGroups = (): boolean => useGroups().some((g) => g.review);
