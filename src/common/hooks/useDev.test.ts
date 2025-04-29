import { renderHook } from '@testing-library/react';
import { useDev } from '~/common/hooks/useDev';

describe('useDev', () => {
    it('return false if NODE_ENV is not set', async () => {
        process.env.NODE_ENV = undefined;
        const { result } = renderHook(() => useDev());

        expect(result.current).toBeFalse();
    });

    it('return false if NODE_ENV is "production"', async () => {
        process.env.NODE_ENV = 'production';
        const { result } = renderHook(() => useDev());

        expect(result.current).toBeFalse();
    });

    it('return true if NODE_ENV is "development"', async () => {
        process.env.NODE_ENV = 'development';
        const { result } = renderHook(() => useDev());

        expect(result.current).toBeTrue();
    });
});
