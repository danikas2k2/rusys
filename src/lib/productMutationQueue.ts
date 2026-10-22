import type { QueryClient } from '@tanstack/react-query';

const queues = new WeakMap<QueryClient, Map<string, Promise<unknown>>>();

export async function runProductMutation(
    client: QueryClient,
    key: readonly (string | number)[],
    operation: () => Promise<void>
): Promise<void> {
    let queue = queues.get(client);
    if (!queue) {
        queue = new Map();
        queues.set(client, queue);
    }

    const id = JSON.stringify(key);
    const previous = queue.get(id);
    const current = previous ? previous.catch(() => undefined).then(operation) : operation();
    queue.set(id, current);
    try {
        await current;
    } finally {
        if (queue.get(id) === current) {
            queue.delete(id);
        }
    }
}
