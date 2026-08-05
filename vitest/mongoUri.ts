import os from 'node:os';
import path from 'node:path';

/**
 * Path to the file used to hand off the shared in-memory MongoDB replica set URI
 * from the `globalSetup.mongo.ts` process to the individual test worker processes.
 */
export const mongoUriFile = path.join(os.tmpdir(), 'rusys-vitest-mongo.uri');
