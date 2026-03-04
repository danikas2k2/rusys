import { renderHook } from '@testing-library/react';

import { useUnderDevelopment } from '~/client/hooks/useUnderDevelopment';
import { useGoogle } from '~/client/state/google/useGoogle';
import { DEV_CLIENT_ID, isDevMode } from '~/common/utils/dev';

jest.mock('~/client/state/google/useGoogle');
jest.mock('~/common/utils/dev', () => ({
    DEV_CLIENT_ID: 'dev-mode',
    isDevMode: jest.fn(),
}));

describe('useUnderDevelopment', () => {
    beforeEach(() => {
        jest.mocked(useGoogle).mockReturnValue({});
        jest.mocked(isDevMode).mockReturnValue(false);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns true when clientId is DEV_CLIENT_ID', () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: DEV_CLIENT_ID });
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(true);
    });

    it('returns true when isDevMode is true', () => {
        jest.mocked(isDevMode).mockReturnValue(true);
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(true);
    });

    it('returns false when clientId differs and isDevMode is false', () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: 'production-client-id' });
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(false);
    });

    it('returns false when clientId is undefined and isDevMode is false', () => {
        jest.mocked(useGoogle).mockReturnValue({});
        const { result } = renderHook(() => useUnderDevelopment());

        expect(result.current).toBe(false);
    });
});
