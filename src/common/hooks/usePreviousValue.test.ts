import { renderHook } from '@testing-library/react';
import { usePreviousValue } from '~/common/hooks/usePreviousValue';

describe('usePreviousValue', () => {
    it('return undefined on initial call, then previous values after changes', () => {
        const { rerender, result } = renderHook((value = 'a') => usePreviousValue(value));

        expect(result.current).toBeUndefined();

        rerender('ab');

        expect(result.current).toBe('a');

        rerender('ab');

        expect(result.current).toBe('ab');
    });
});
