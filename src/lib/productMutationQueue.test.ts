import { QueryClient } from '@tanstack/react-query';

import { runProductMutation } from './productMutationQueue';

function deferred() {
    let resolve!: () => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<void>((onResolve, onReject) => {
        resolve = onResolve;
        reject = onReject;
    });
    return { promise, resolve, reject };
}

describe('runProductMutation', () => {
    it('serializes mutations for the same client and product', async () => {
        const client = new QueryClient();
        const gate = deferred();
        const calls: string[] = [];
        const first = runProductMutation(client, ['products', 'group', 'name'], async () => {
            calls.push('first started');
            await gate.promise;
            calls.push('first finished');
        });
        const second = runProductMutation(client, ['products', 'group', 'name'], async () => {
            calls.push('second');
        });

        expect(calls).toStrictEqual(['first started']);

        gate.resolve();
        await Promise.all([first, second]);

        expect(calls).toStrictEqual(['first started', 'first finished', 'second']);

        await runProductMutation(client, ['products', 'group', 'name'], async () => {
            calls.push('third');
        });

        expect(calls.at(-1)).toBe('third');
    });

    it('continues the queue after a failed mutation and propagates that failure', async () => {
        const client = new QueryClient();
        const gate = deferred();
        const failed = runProductMutation(client, ['products', 'item'], () => gate.promise);
        const failure = failed.catch((error: unknown) => error);
        const next = vi.fn(async () => {});
        const queued = runProductMutation(client, ['products', 'item'], next);

        expect(next).not.toHaveBeenCalled();

        gate.reject(new Error('update failed'));

        await expect(failure).resolves.toStrictEqual(new Error('update failed'));

        await queued;

        expect(next).toHaveBeenCalledExactlyOnceWith(undefined);
    });

    it('runs distinct product keys and clients independently', async () => {
        const client = new QueryClient();
        const otherClient = new QueryClient();
        const gate = deferred();
        const blocked = runProductMutation(client, ['products', 1], () => gate.promise);
        const differentKey = vi.fn(async () => {});
        const differentClient = vi.fn(async () => {});

        await Promise.all([
            runProductMutation(client, ['products', 2], differentKey),
            runProductMutation(otherClient, ['products', 1], differentClient),
        ]);

        expect(differentKey).toHaveBeenCalledExactlyOnceWith();
        expect(differentClient).toHaveBeenCalledExactlyOnceWith();

        gate.resolve();
        await blocked;
    });
});
