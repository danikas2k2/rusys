export interface MockedFetch {
    fetch: jest.Mock<Response | null, [string, object]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: jest.Mock<any, []>;
}

export function mockFetch(): MockedFetch {
    const json = jest.fn();
    const fetch = jest.fn().mockResolvedValue({ json });

    const backup = global.fetch;

    beforeAll(() => {
        global.fetch = fetch;
    });

    afterAll(() => {
        global.fetch = backup;
    });

    return { fetch, json };
}
