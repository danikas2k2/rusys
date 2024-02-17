import { getTestSummary } from '~/tests/fixtures';

export const useSummary = jest.fn().mockReturnValue(getTestSummary());
