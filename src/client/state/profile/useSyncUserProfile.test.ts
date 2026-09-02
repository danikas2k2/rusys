import { act, renderHook, waitFor } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useProfile } from '~/client/state/profile/useProfile';
import { useSyncUserProfile } from '~/client/state/profile/useSyncUserProfile';
import { ApiUrl } from '~/common/api';

vi.mock(import('~/client/state/common/useApiRequest'));
vi.mock(import('~/client/state/profile/useProfile'));

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

// Helper to flush all pending promises (microtasks)
const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('useSyncUserProfile', () => {
    afterEach(() => vi.clearAllMocks());

    it('does nothing when profile.email is undefined', async () => {
        const request = vi.fn();
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useProfile).mockReturnValue({} as any);

        renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        expect(request).not.toHaveBeenCalled();
    });

    it('does nothing when profile.email is blank whitespace', async () => {
        const request = vi.fn();
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useProfile).mockReturnValue({ email: '   ' } as any);

        renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        expect(request).not.toHaveBeenCalled();
    });

    it('calls UserProfileUpsert immediately on first render with an email (key changed)', async () => {
        const request = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useProfile).mockReturnValue({
            email: 'user@example.com',
            name: 'Alice',
            picture: 'pic.png',
        } as any);

        renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        expect(request).toHaveBeenCalledWith(ApiUrl.UserProfileUpsert, {
            email: 'user@example.com',
            name: 'Alice',
            picture: 'pic.png',
        });
    });

    it('re-calls UserProfileUpsert when profile name changes (key differs)', async () => {
        const request = vi.fn().mockResolvedValue({ ok: true });
        vi.mocked(useApiRequest).mockReturnValue(request);

        const mockUseProfile = vi.mocked(useProfile);
        mockUseProfile.mockReturnValue({ email: 'user@example.com', name: 'Alice', picture: undefined } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        expect(request).toHaveBeenCalledTimes(1);
        expect(request).toHaveBeenLastCalledWith(ApiUrl.UserProfileUpsert, expect.objectContaining({ name: 'Alice' }));

        mockUseProfile.mockReturnValue({ email: 'user@example.com', name: 'Bob', picture: undefined } as any);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        expect(request).toHaveBeenCalledTimes(2);
        expect(request).toHaveBeenLastCalledWith(ApiUrl.UserProfileUpsert, expect.objectContaining({ name: 'Bob' }));
    });

    // To reach the staleness-check path, we need the effect to re-run with the SAME key
    // (same email/name/picture). The only dep that can change without changing the key is `request`.
    // We mock useApiRequest to return a new function reference on the second render,
    // which causes `request` to be a new dep value → effect re-runs → key matches → staleness check.
    it('calls UserProfiles to check staleness when key is unchanged but request reference changes', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({ ok: true, profiles: [] });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({ email: 'check@example.com', name: 'Eve', picture: undefined } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        // First render: key was '' → key changed → upsert via request1
        expect(request1).toHaveBeenCalledWith(
            ApiUrl.UserProfileUpsert,
            expect.objectContaining({ email: 'check@example.com' })
        );

        // Rerender: request ref changes → effect re-fires with same key → staleness check via request2
        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        expect(request2).toHaveBeenCalledWith(ApiUrl.UserProfiles, { emails: ['check@example.com'] });
    });

    it('deduplicates staleness check — does NOT call UserProfiles twice for the same email', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({ ok: true, profiles: [] });
        const request3 = vi.fn().mockResolvedValue({ ok: true, profiles: [] });

        vi.mocked(useApiRequest)
            .mockReturnValueOnce(request1)
            .mockReturnValueOnce(request2)
            .mockReturnValueOnce(request3);

        vi.mocked(useProfile).mockReturnValue({
            email: 'dedup@example.com',
            name: 'Fred',
            picture: undefined,
        } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        // Third render — same email, already checked → UserProfiles NOT called again
        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        // request2 was used for the staleness check, request3 should NOT have called UserProfiles
        expect(request2).toHaveBeenCalledWith(ApiUrl.UserProfiles, expect.anything());
        expect(request3).not.toHaveBeenCalledWith(ApiUrl.UserProfiles, expect.anything());
    });

    it('does NOT upsert if profile is fresh (updatedAt within STALE_MS)', async () => {
        const freshUpdatedAt = Date.now() - 1000; // 1 second ago
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({
            ok: true,
            profiles: [{ email: 'fresh@example.com', updatedAt: freshUpdatedAt }],
        });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({
            email: 'fresh@example.com',
            name: 'Gina',
            picture: undefined,
        } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        await waitFor(() => {
            expect(request2).toHaveBeenCalledWith(ApiUrl.UserProfiles, { emails: ['fresh@example.com'] });
        });

        // Profile is fresh — should NOT upsert again via request2
        expect(request2).not.toHaveBeenCalledWith(ApiUrl.UserProfileUpsert, expect.anything());
    });

    it('dOES upsert if profile is stale (updatedAt > STALE_MS ago)', async () => {
        const staleUpdatedAt = Date.now() - STALE_MS - 1000;
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({
            ok: true,
            profiles: [{ email: 'stale@example.com', updatedAt: staleUpdatedAt }],
        });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({
            email: 'stale@example.com',
            name: 'Hank',
            picture: undefined,
        } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        await waitFor(() => {
            expect(request2).toHaveBeenCalledWith(
                ApiUrl.UserProfileUpsert,
                expect.objectContaining({ email: 'stale@example.com' })
            );
        });
    });

    it('dOES upsert if existing profile not found in profiles response', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({ ok: true, profiles: [] });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({
            email: 'missing@example.com',
            name: 'Iris',
            picture: undefined,
        } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        await waitFor(() => {
            expect(request2).toHaveBeenCalledWith(
                ApiUrl.UserProfileUpsert,
                expect.objectContaining({ email: 'missing@example.com' })
            );
        });
    });

    it('treats a response with no profiles field as empty and upserts', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        // Server response omits `profiles` entirely (malformed/legacy response shape)
        const request2 = vi.fn().mockResolvedValue({ ok: true });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({
            email: 'noprofiles@example.com',
            name: 'Noah',
            picture: undefined,
        } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        await waitFor(() => {
            expect(request2).toHaveBeenCalledWith(
                ApiUrl.UserProfileUpsert,
                expect.objectContaining({ email: 'noprofiles@example.com' })
            );
        });
    });

    it('dOES upsert if existing found but updatedAt is 0 (falsy)', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({
            ok: true,
            profiles: [{ email: 'zero@example.com', updatedAt: 0 }],
        });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({ email: 'zero@example.com', name: 'Jack', picture: undefined } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        await waitFor(() => {
            expect(request2).toHaveBeenCalledWith(
                ApiUrl.UserProfileUpsert,
                expect.objectContaining({ email: 'zero@example.com' })
            );
        });
    });

    it('does nothing if result.ok is false (skips upsert)', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockResolvedValue({ ok: false, error: 'not allowed' });

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({ email: 'no@example.com', name: 'Kate', picture: undefined } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await act(async () => {
            rerender();
        });
        await act(flushPromises);

        await waitFor(() => {
            expect(request2).toHaveBeenCalledWith(ApiUrl.UserProfiles, { emails: ['no@example.com'] });
        });

        // result.ok is false → early return → no second upsert
        expect(request2).not.toHaveBeenCalledWith(ApiUrl.UserProfileUpsert, expect.anything());
    });

    it('handles UserProfiles request throwing without propagating the error', async () => {
        const request1 = vi.fn().mockResolvedValue({ ok: true });
        const request2 = vi.fn().mockRejectedValue(new Error('network error'));

        vi.mocked(useApiRequest).mockReturnValueOnce(request1).mockReturnValueOnce(request2);

        vi.mocked(useProfile).mockReturnValue({ email: 'throw@example.com', name: 'Leo', picture: undefined } as any);

        const { rerender } = renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
        await act(flushPromises);

        await expect(
            act(async () => {
                rerender();
            })
        ).resolves.not.toThrow();

        await act(flushPromises);

        expect(request2).toHaveBeenCalledWith(ApiUrl.UserProfiles, { emails: ['throw@example.com'] });
    });

    it('handles initial UserProfileUpsert request throwing (catch in first-render branch)', async () => {
        const request = vi.fn().mockRejectedValue(new Error('network error'));
        vi.mocked(useApiRequest).mockReturnValue(request);
        vi.mocked(useProfile).mockReturnValue({
            email: 'throwinit@example.com',
            name: 'Mia',
            picture: undefined,
        } as any);

        // Should not throw — the .catch(() => undefined) in the hook swallows the error
        let threw = false;
        try {
            renderHook(() => useSyncUserProfile(), { wrapper: MockRedux });
            await act(flushPromises);
        } catch {
            threw = true;
        }

        expect(threw).toBe(false);
        expect(request).toHaveBeenCalledWith(
            ApiUrl.UserProfileUpsert,
            expect.objectContaining({ email: 'throwinit@example.com' })
        );
    });
});
