import { vi } from 'vitest';

import type { ClientSession } from 'mongodb';

import { FakeMongo } from '../../../vitest/fakeDb';

const fake = new FakeMongo();

export const getClient = vi.fn(async () => fake.client);

export const db = vi.fn(async (name?: string) => fake.db(name ?? 'test'));

export const withinTransaction = vi.fn(async <T>(fn: (session: ClientSession) => Promise<T>) => fake.transaction(fn));
