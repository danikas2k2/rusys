import { register } from '~/instrumentation';
import { logEvent } from '~/server/logging';
import { startStagedImageCleanup } from '~/server/stagedImageCleanupScheduler';

vi.mock(import('~/server/logging'));
vi.mock(import('~/server/telemetry'));
vi.mock(import('~/server/stagedImageCleanupScheduler'));

describe('staged image cleanup startup', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    it('starts cleanup and reports failures without leaking paths or exception data', async () => {
        vi.stubEnv('NEXT_RUNTIME', 'nodejs');
        vi.mocked(startStagedImageCleanup).mockImplementationOnce((_directory, onError) => {
            onError();
            return () => undefined;
        });
        await register();

        expect(startStagedImageCleanup).toHaveBeenCalledWith(expect.stringMatching(/\.pending$/), expect.any(Function));
        expect(logEvent).toHaveBeenCalledWith('runtime_output_redacted', {}, 'error');
    });
});
