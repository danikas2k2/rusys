import { getYearsFixture } from '@tests/fixtures';

import { vi } from 'vitest';

export const useYears = vi.fn().mockReturnValue(getYearsFixture());
