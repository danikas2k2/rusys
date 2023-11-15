export interface MockedStorage extends Storage {
    getItem: jest.Mock<string | null, [string]>;
    setItem: jest.Mock<void, [string, string]>;
    removeItem: jest.Mock<void, [string]>;
    clear: jest.Mock<void, []>;
    key: jest.Mock<string | null, [number]>;
    getLength: jest.Mock<number, []>;
}

export function mockLocalStorage(): MockedStorage {
    const data = new Map();

    const storage: MockedStorage = {
        getItem: jest.fn().mockImplementation((key: string) => data.get(key) || null),
        setItem: jest.fn().mockImplementation((key: string, value: string) => data.set(key, value)),
        removeItem: jest.fn().mockImplementation((key: string) => data.delete(key)),
        clear: jest.fn().mockImplementation(() => data.clear()),
        key: jest.fn().mockImplementation((index: number) => Array.from(data.keys())[index] || null),
        getLength: jest.fn().mockImplementation(() => data.size),
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
