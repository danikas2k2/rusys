import { useIdentity } from '~/components/app/IdentityContext';
import type { Google } from './types';

export const useGoogle = (): Google => ({ clientId: useIdentity().clientId });
