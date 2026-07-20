import { getSummaryFixture } from '@tests/fixtures';

import { vi } from 'vitest';

export const useSummary = vi.fn().mockReturnValue(getSummaryFixture());
