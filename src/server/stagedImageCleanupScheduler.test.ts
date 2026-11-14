/** @vitest-environment node */
import { cleanupStagedImages } from '~/server/data/stagedImageCleanup';
import { startStagedImageCleanup } from '~/server/stagedImageCleanupScheduler';

vi.mock(import('~/server/data/stagedImageCleanup'));

describe('staged image cleanup scheduler', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.mocked(cleanupStagedImages).mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.resetAllMocks();
    });

    it('runs at startup, hourly and stops when disposed', async () => {
        const stop = startStagedImageCleanup('/staged', vi.fn());
        try {
            expect(cleanupStagedImages).toHaveBeenCalledWith('/staged');

            await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

            expect(cleanupStagedImages).toHaveBeenCalledTimes(4);

            stop();
            await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

            expect(cleanupStagedImages).toHaveBeenCalledTimes(4);
        } finally {
            stop();
        }
    });

    it('reports errors and retries after failure', async () => {
        vi.mocked(cleanupStagedImages).mockRejectedValueOnce(new Error('unavailable'));
        const onError = vi.fn();
        const stop = startStagedImageCleanup('/staged', onError);
        try {
            await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

            expect(onError).toHaveBeenCalledExactlyOnceWith();
            expect(cleanupStagedImages).toHaveBeenCalledTimes(3);
        } finally {
            stop();
        }
    });

    it('does not overlap slow cleanup runs', async () => {
        let finish: () => void = () => undefined;
        vi.mocked(cleanupStagedImages).mockReturnValueOnce(
            new Promise<void>((resolve) => {
                finish = resolve;
            })
        );
        const stop = startStagedImageCleanup('/staged', vi.fn());
        try {
            await vi.advanceTimersByTimeAsync(2 * 60 * 60 * 1000);

            expect(cleanupStagedImages).toHaveBeenCalledExactlyOnceWith('/staged');

            finish();
            await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

            expect(cleanupStagedImages).toHaveBeenCalledTimes(4);
        } finally {
            finish();
            stop();
        }
    });
});
