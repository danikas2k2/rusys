import { renderHook } from '@testing-library/react';
import { mockQuery } from '@tests/MockQuery';

import { useGoogle } from './useGoogle';

describe('useGoogle', () => {
    it('reads the empty server configuration', () => {
        const { wrapper } = mockQuery();
        const { result } = renderHook(useGoogle, { wrapper });

        expect(result.current.clientId).toBe('');
    });

    it('reads the client id supplied by the server', () => {
        const { wrapper } = mockQuery({ google: { clientId: '123' } });
        const { result } = renderHook(useGoogle, { wrapper });

        expect(result.current.clientId).toBe('123');
    });
});
