import { vi, type Mock } from 'vitest';

export interface MockedStorage extends Storage {
    getItem: Mock<Storage['getItem']>;
    setItem: Mock<Storage['setItem']>;
    removeItem: Mock<Storage['removeItem']>;
    clear: Mock<Storage['clear']>;
    key: Mock<Storage['key']>;
    getLength: Mock<() => number>;
}

export function mockLocalStorage(): MockedStorage {
    const data = new Map();

    const storage: MockedStorage = {
        getItem: vi.fn<Storage['getItem']>((key) => data.get(key) || null),
        setItem: vi.fn<Storage['setItem']>((key, value) => data.set(key, value)),
        removeItem: vi.fn<Storage['removeItem']>((key) => data.delete(key)),
        clear: vi.fn<Storage['clear']>(() => data.clear()),
        key: vi.fn<Storage['key']>((index) => Array.from(data.keys())[index] || null),
        getLength: vi.fn<() => number>(() => data.size),
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
