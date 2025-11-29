import type { Mock } from 'vitest';

export interface MockedStorage extends Storage {
    getItem: Mock<string | null, [string]>;
    setItem: Mock<void, [string, string]>;
    removeItem: Mock<void, [string]>;
    clear: Mock<void, []>;
    key: Mock<string | null, [number]>;
    getLength: Mock<number, []>;
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
