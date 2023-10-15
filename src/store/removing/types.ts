import { type Name, type Year } from '~/store/types';

export type Removing = Record<Year, boolean>;
export type RemovingSet = Record<Name, Removing>;
export type NamedRemoving = { name: string } & Removing;
