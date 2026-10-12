process.env.CHROME_PATH ??= require('playwright').chromium.executablePath();

module.exports = {
    ci: {
        collect: {
            startServerCommand: 'node --import tsx scripts/lighthouse-server.ts',
            startServerReadyPattern: 'Ready in',
            url: [
                'http://127.0.0.1:4173/',
                'http://127.0.0.1:4173/summary',
                'http://127.0.0.1:4173/categories',
                'http://127.0.0.1:4173/variants',
                'http://127.0.0.1:4173/offline',
            ],
            numberOfRuns: 1,
            settings: {
                chromeFlags: '--no-sandbox --headless=new',
                extraHeaders: { Cookie: `rusys_session=${'a'.repeat(64)}` },
            },
        },
        assert: {
            assertions: {
                'categories:accessibility': ['error', { minScore: 0.9 }],
            },
        },
        upload: { target: 'filesystem', outputDir: './.lighthouseci' },
    },
};
