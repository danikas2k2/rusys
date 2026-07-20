import { getGroupsFixture } from '@tests/fixtures';

import { vi } from 'vitest';

export const useGroups = vi.fn().mockReturnValue(getGroupsFixture());
