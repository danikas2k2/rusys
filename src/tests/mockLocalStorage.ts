import { vi } from 'vitest';

export interface MockedStorage extends Storage {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    key: ReturnType<typeof vi.fn>;
    getLength: ReturnType<typeof vi.fn>;
}

export function mockLocalStorage(): MockedStorage {
    const data = new Map();

    const storage: MockedStorage = {
        getItem: vi.fn().mockImplementation((key: string) => data.get(key) || null),
        setItem: vi.fn().mockImplementation((key: string, value: string) => data.set(key, value)),
        removeItem: vi.fn().mockImplementation((key: string) => data.delete(key)),
        clear: vi.fn().mockImplementation(() => data.clear()),
        key: vi.fn().mockImplementation((index: number) => Array.from(data.keys())[index] || null),
        getLength: vi.fn().mockImplementation(() => data.size),
        length: 0,
    };

    Object.defineProperty(storage, 'length', {
        get: storage.getLength,
    });

    const backup = global.localStorage;

    beforeAll(() => {
        Object.defineProperty(global, 'localStorage', {
            value: storage,
        });
    });

    afterAll(() => {
        Object.defineProperty(global, 'localStorage', {
            value: backup,
        });
    });

    return storage;
}
