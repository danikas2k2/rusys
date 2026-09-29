import { createContext } from 'react';

import type { InitialResource } from '~/components/app/initialData';

export const InitialResourceContext = createContext<InitialResource | undefined>(undefined);
