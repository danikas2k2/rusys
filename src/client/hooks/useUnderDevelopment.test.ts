import { renderHook } from '@testing-library/react';

import { DEV_CLIENT_ID, isDevMode } from '@rusys/common/utils/dev';

import { useUnderDevelopment } from '~/client/hooks/useUnderDevelopment';
import { useGoogle } from '~/client/state/google/useGoogle';

vi.mock(import('~/client/state/google/useGoogle'));
vi.mock(import('@rusys/common/utils/dev'), (): any => ({
    DEV_CLIENT_ID: 'dev-mode',
    isDevMode: vi.fn(),
}));

describe('useUnderDevelopment', () => {
    beforeEach(() => {
        vi.mocked(useGoogle).mockReturnValue({});
        vi.mocked(isDevMode).mockReturnValue(false);
    });

    afterEach(() => vi.clearAllMocks());

    it('returns true when clientId is DEV_CLIENT_ID', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: DEV_CLIENT_ID });
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(true);
    });

    it('returns true when isDevMode is true', () => {
        vi.mocked(isDevMode).mockReturnValue(true);
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(true);
    });

    it('returns false when clientId differs and isDevMode is false', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: 'production-client-id' });
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(false);
    });

    it('returns false when clientId is undefined and isDevMode is false', () => {
        vi.mocked(useGoogle).mockReturnValue({});
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(false);
    });
});
