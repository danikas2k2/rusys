import { renderHook } from '@testing-library/react';

import { useGoogle } from '~/store/google/useGoogle';
import { useGoogleClientId } from '~/store/google/useGoogleClientId';

vi.mock(import('~/store/google/useGoogle'));

describe('useGoogleClientId', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns the client ID passed from the server', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: '123' });

        const { result } = renderHook(() => useGoogleClientId());

        expect(result.current).toBe('123');
    });

    it('returns an empty string when the server has no client ID', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: undefined });

        const { result } = renderHook(() => useGoogleClientId());

        expect(result.current).toBe('');
    });
});
