import { getYearsFixture } from '@tests/fixtures';
import { vi } from 'vitest';

export const getYears = vi.fn().mockReturnValue(getYearsFixture());
