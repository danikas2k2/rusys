import { vi } from 'vitest';

import { FakeMongo } from '../../../vitest/fakeDb';
import type * as DbModule from '../db';

const fake = new FakeMongo();

export const getClient = vi.fn(async () => fake.client);

export const db = vi.fn(async (name?: string) => fake.db(name ?? 'test'));

export const withTransaction = vi.fn(async (fn: Parameters<typeof DbModule.withTransaction>[0]) =>
    fake.transaction(fn)
);
