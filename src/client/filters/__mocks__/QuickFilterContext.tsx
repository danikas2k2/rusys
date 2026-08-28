import { vi } from 'vitest';

import React from 'react';

export const QuickFilterContextWrapper = vi.fn(({ children }: React.PropsWithChildren) => <>{children}</>);
