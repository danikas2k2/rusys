import React from 'react';
import { vi } from 'vitest';

export const QuickFilterContextWrapper = vi.fn(({ children }: React.PropsWithChildren) => <>{children}</>);
