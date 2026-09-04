describe('helmetOptions (dev mode)', () => {
    let helmetOptions: typeof import('~/server/helmetOptions').default; // oxlint-disable-line typescript/consistent-type-imports

    beforeAll(async () => {
        vi.doMock(import('@rusys/common/utils/dev'), () => ({ isDevMode: () => true }));
        vi.resetModules();
        helmetOptions = (await import('~/server/helmetOptions')).default;
    });

    afterAll(() => {
        vi.resetModules();
        vi.doUnmock('@rusys/common/utils/dev');
    });

    it('disables hsts in dev mode', () => {
        expect(helmetOptions.hsts).toBe(false);
    });

    it('includes ws:// WebSocket hosts in connectSrc in dev mode', () => {
        const connectSrc = (helmetOptions.contentSecurityPolicy as { directives: { connectSrc: string[] } }).directives
            .connectSrc;

        expect(connectSrc).toContain('ws://localhost:5173');
        expect(connectSrc).toContain('ws://127.0.0.1:5173');
    });

    it("includes 'unsafe-inline' in scriptSrcElem in dev mode", () => {
        const scriptSrcElem = (helmetOptions.contentSecurityPolicy as { directives: { scriptSrcElem: string[] } })
            .directives.scriptSrcElem;

        expect(scriptSrcElem).toContain("'unsafe-inline'");
    });

    it('sets upgradeInsecureRequests to null in dev mode', () => {
        const upgradeInsecureRequests = (
            helmetOptions.contentSecurityPolicy as { directives: { upgradeInsecureRequests: null | string[] } }
        ).directives.upgradeInsecureRequests;

        expect(upgradeInsecureRequests).toBeNull();
    });
});

describe('helmetOptions (prod mode)', () => {
    let helmetOptions: typeof import('~/server/helmetOptions').default; // oxlint-disable-line typescript/consistent-type-imports

    beforeAll(async () => {
        vi.doMock(import('@rusys/common/utils/dev'), () => ({ isDevMode: () => false }));
        vi.resetModules();
        helmetOptions = (await import('~/server/helmetOptions')).default;
    });

    afterAll(() => {
        vi.resetModules();
        vi.doUnmock('@rusys/common/utils/dev');
    });

    it('enables hsts with correct options in prod mode', () => {
        expect(helmetOptions.hsts).toMatchObject({
            maxAge: 180 * 86400,
            includeSubDomains: false,
            preload: false,
        });
    });

    it('does not include ws:// WebSocket hosts in connectSrc in prod mode', () => {
        const connectSrc = (helmetOptions.contentSecurityPolicy as { directives: { connectSrc: string[] } }).directives
            .connectSrc;

        expect(connectSrc).not.toContain('ws://localhost:5173');
        expect(connectSrc).not.toContain('ws://127.0.0.1:5173');
    });

    it('sets upgradeInsecureRequests to [] in prod mode', () => {
        const upgradeInsecureRequests = (
            helmetOptions.contentSecurityPolicy as { directives: { upgradeInsecureRequests: null | string[] } }
        ).directives.upgradeInsecureRequests;

        expect(upgradeInsecureRequests).toStrictEqual([]);
    });

    it("includes 'unsafe-inline' via prodInlineScriptHashes in scriptSrcElem in prod mode", () => {
        const scriptSrcElem = (helmetOptions.contentSecurityPolicy as { directives: { scriptSrcElem: string[] } })
            .directives.scriptSrcElem;

        // prodInlineScriptHashes contains "'unsafe-inline'" as a placeholder
        expect(scriptSrcElem).toContain("'unsafe-inline'");
    });
});
