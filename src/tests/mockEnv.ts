export function mockEnv(): void {
    const env = process.env;

    beforeEach(() => {
        process.env = { ...env };
    });

    afterAll(() => {
        process.env = env;
    });
}
